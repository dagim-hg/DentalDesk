import { Router, Request, Response } from 'express';
import { pool } from '../db/pool.js';
import { requireAuth, requireRole } from '../auth/middleware.js';
import { hashPassword } from '../auth/jwt.js';

export const usersRouter = Router();

// GET /api/users/practitioners - Open to authenticated staff for appointment scheduling
usersRouter.get('/practitioners', requireAuth, async (_req: Request, res: Response) => {
  try {
    const { rows } = await pool.query(
      "SELECT id, full_name AS \"fullName\", role, title, avatar FROM users WHERE role IN ('ROLE_DENTIST', 'ROLE_OWNER') AND is_active = true ORDER BY full_name ASC"
    );
    res.json(rows);
  } catch (err: any) {
    console.error('Error fetching practitioners:', err);
    res.status(500).json({ error: 'Failed to fetch practitioners' });
  }
});

// GET /api/users - Staff management, Owner and Admin ONLY
usersRouter.get('/', requireRole(['ROLE_OWNER', 'ROLE_ADMIN']), async (_req: Request, res: Response) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, username, full_name AS "fullName", role, title, email, phone, avatar, is_active AS "isActive", created_at AS "createdAt"
       FROM users 
       ORDER BY id ASC`
    );
    res.json(rows);
  } catch (err: any) {
    console.error('Error listing users:', err);
    res.status(500).json({ error: 'Failed to fetch users list' });
  }
});

// POST /api/users - Create new staff account, Owner and Admin ONLY
usersRouter.post('/', requireRole(['ROLE_OWNER', 'ROLE_ADMIN']), async (req: Request, res: Response) => {
  try {
    const { username, fullName, role, title, email, phone, password } = req.body;

    if (!username || !fullName || !role) {
      return res.status(400).json({ error: 'Username, Full Name, and Role are mandatory' });
    }

    const validRoles = ['ROLE_OWNER', 'ROLE_DENTIST', 'ROLE_ASSISTANT', 'ROLE_RECEPTIONIST', 'ROLE_ADMIN'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: 'Invalid user role specified' });
    }

    // Check unique username
    const existCheck = await pool.query('SELECT id FROM users WHERE username = $1', [username.trim().toLowerCase()]);
    if (existCheck.rows.length > 0) {
      return res.status(409).json({ error: 'Username already in use' });
    }

    const rawPassword = password || 'DentalDesk@2026';
    const pwdHash = hashPassword(rawPassword);

    const initials = fullName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();

    const insertSql = `
      INSERT INTO users (username, full_name, role, title, email, phone, avatar, password_hash, is_active)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true)
      RETURNING id, username, full_name AS "fullName", role, title, email, phone, avatar, is_active AS "isActive", created_at AS "createdAt"
    `;

    const { rows } = await pool.query(insertSql, [
      username.trim().toLowerCase(),
      fullName.trim(),
      role,
      title || 'Clinic Staff',
      email || null,
      phone || null,
      initials,
      pwdHash
    ]);

    const newUser = rows[0];

    // Audit log
    await pool.query(
      `INSERT INTO audit_logs (user_id, user_name, action_type, entity_name, entity_id, details)
       VALUES ($1, $2, 'CREATE', 'User', $3, $4)`,
      [req.user!.id, req.user!.fullName, newUser.id, `Created staff account '${newUser.username}' with role '${newUser.role}'`]
    );

    res.status(201).json(newUser);
  } catch (err: any) {
    console.error('Error creating user:', err);
    res.status(500).json({ error: 'Failed to create user account' });
  }
});

// PUT /api/users/:id - Update staff account / role assignment
usersRouter.put('/:id', requireRole(['ROLE_OWNER', 'ROLE_ADMIN']), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { fullName, role, title, email, phone, isActive, password } = req.body;

    const existingRes = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    if (existingRes.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const existing = existingRes.rows[0];

    let updateSql = `
      UPDATE users SET
        full_name = COALESCE($1, full_name),
        role = COALESCE($2, role),
        title = COALESCE($3, title),
        email = COALESCE($4, email),
        phone = COALESCE($5, phone),
        is_active = COALESCE($6, is_active)
    `;
    const params: any[] = [
      fullName ?? existing.full_name,
      role ?? existing.role,
      title ?? existing.title,
      email ?? existing.email,
      phone ?? existing.phone,
      isActive ?? existing.is_active
    ];

    if (password) {
      params.push(hashPassword(password));
      updateSql += `, password_hash = $${params.length}`;
    }

    params.push(id);
    updateSql += ` WHERE id = $${params.length}
      RETURNING id, username, full_name AS "fullName", role, title, email, phone, avatar, is_active AS "isActive"`;

    const { rows } = await pool.query(updateSql, params);
    const updated = rows[0];

    // Audit log
    await pool.query(
      `INSERT INTO audit_logs (user_id, user_name, action_type, entity_name, entity_id, details)
       VALUES ($1, $2, 'UPDATE', 'User', $3, $4)`,
      [req.user!.id, req.user!.fullName, id, `Updated staff profile & role for ${updated.username} (${updated.role})`]
    );

    res.json(updated);
  } catch (err: any) {
    console.error('Error updating user:', err);
    res.status(500).json({ error: 'Failed to update user' });
  }
});
