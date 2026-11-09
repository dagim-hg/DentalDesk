import { Router, Request, Response } from 'express';
import { pool } from '../db/pool.js';
import { requireAuth, requireRole } from '../auth/middleware.js';
import { hashPassword } from '../auth/jwt.js';

export const usersRouter = Router();

// Ensure staff columns exist in PostgreSQL and seed defaults if empty
pool.query(`
  ALTER TABLE users 
  ADD COLUMN IF NOT EXISTS license_number VARCHAR(100),
  ADD COLUMN IF NOT EXISTS specialization VARCHAR(100),
  ADD COLUMN IF NOT EXISTS assigned_chair VARCHAR(50),
  ADD COLUMN IF NOT EXISTS employment_type VARCHAR(50) DEFAULT 'Full-Time',
  ADD COLUMN IF NOT EXISTS work_schedule VARCHAR(100) DEFAULT 'Mon-Fri 08:30 - 17:00',
  ADD COLUMN IF NOT EXISTS emergency_contact VARCHAR(150),
  ADD COLUMN IF NOT EXISTS notes TEXT;

  UPDATE users SET
    license_number = 'DDS-2019-8842',
    specialization = 'General & Cosmetic Dentistry',
    assigned_chair = 'Chair 1 (Main Operatory)',
    employment_type = 'Full-Time',
    work_schedule = 'Mon-Fri 08:30 - 17:00',
    emergency_contact = 'Claire Chen (Spouse) +1 555-0182',
    notes = 'Board certified in prosthodontics and implantology.'
  WHERE username = 'dr.chen' AND (license_number IS NULL OR specialization IS NULL);

  UPDATE users SET
    license_number = 'RDH-2021-3910',
    specialization = 'Preventive Hygiene & Periodontics',
    assigned_chair = 'Chair 2 (Hygiene Suite)',
    employment_type = 'Full-Time',
    work_schedule = 'Tue-Sat 08:00 - 16:30',
    emergency_contact = 'Robert Rostova (Parent) +1 555-0199',
    notes = 'Specialist in ultrasonic scaling and fluoride treatments.'
  WHERE username = 'elena.r' AND (license_number IS NULL OR specialization IS NULL);

  UPDATE users SET
    license_number = 'CDA-2022-1049',
    specialization = 'Chairside Assistance & Sedation',
    assigned_chair = 'Chair 3 (Surgical Operatory)',
    employment_type = 'Full-Time',
    work_schedule = 'Mon-Fri 09:00 - 17:30',
    emergency_contact = 'David Kim (Brother) +1 555-0144',
    notes = 'Four-handed dentistry certification, CPR/BLS current.'
  WHERE username = 'chloe.k' AND (license_number IS NULL OR specialization IS NULL);

  UPDATE users SET
    license_number = 'DMD-2014-4901',
    specialization = 'Oral Surgery & Practice Owner',
    assigned_chair = 'Chair 1 (Main Operatory)',
    employment_type = 'Full-Time',
    work_schedule = 'Mon-Fri 08:00 - 18:00',
    emergency_contact = 'Sarah Vance (Spouse) +1 555-0100',
    notes = 'Practice Founder & Clinical Director. Fellow of ICOI.'
  WHERE username = 'marcus.v' AND (license_number IS NULL OR specialization IS NULL);
`).catch(err => console.warn('User columns init check:', err.message));

// GET /api/users/practitioners - Open to authenticated staff for appointment scheduling
usersRouter.get('/practitioners', requireAuth, async (_req: Request, res: Response) => {
  try {
    const { rows } = await pool.query(
      "SELECT id, full_name AS \"fullName\", role, title, avatar, specialization, assigned_chair AS \"assignedChair\" FROM users WHERE role IN ('ROLE_DENTIST', 'ROLE_OWNER') AND is_active = true ORDER BY full_name ASC"
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
      `SELECT 
         id, 
         username, 
         full_name AS "fullName", 
         role, 
         title, 
         email, 
         phone, 
         avatar, 
         is_active AS "isActive", 
         license_number AS "licenseNumber",
         specialization,
         assigned_chair AS "assignedChair",
         employment_type AS "employmentType",
         work_schedule AS "workSchedule",
         emergency_contact AS "emergencyContact",
         notes,
         created_at AS "createdAt"
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
    const { 
      username, 
      fullName, 
      role, 
      title, 
      email, 
      phone, 
      password,
      licenseNumber,
      specialization,
      assignedChair,
      employmentType,
      workSchedule,
      emergencyContact,
      notes
    } = req.body;

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
      INSERT INTO users (
        username, full_name, role, title, email, phone, avatar, password_hash, is_active,
        license_number, specialization, assigned_chair, employment_type, work_schedule, emergency_contact, notes
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true, $9, $10, $11, $12, $13, $14, $15)
      RETURNING 
        id, username, full_name AS "fullName", role, title, email, phone, avatar, is_active AS "isActive",
        license_number AS "licenseNumber", specialization, assigned_chair AS "assignedChair",
        employment_type AS "employmentType", work_schedule AS "workSchedule", emergency_contact AS "emergencyContact", notes,
        created_at AS "createdAt"
    `;

    const { rows } = await pool.query(insertSql, [
      username.trim().toLowerCase(),
      fullName.trim(),
      role,
      title || 'Clinic Staff',
      email || null,
      phone || null,
      initials,
      pwdHash,
      licenseNumber || null,
      specialization || null,
      assignedChair || null,
      employmentType || 'Full-Time',
      workSchedule || 'Mon-Fri 08:30 - 17:00',
      emergencyContact || null,
      notes || null
    ]);

    const newUser = rows[0];

    // Audit log
    await pool.query(
      `INSERT INTO audit_logs (user_id, user_name, action_type, entity_name, entity_id, details)
       VALUES ($1, $2, 'CREATE', 'User', $3, $4)`,
      [req.user!.id, req.user!.fullName, newUser.id, `Created staff account '${newUser.username}' with role '${newUser.role}', specialization: '${newUser.specialization || 'N/A'}'`]
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
    const { 
      fullName, role, title, email, phone, isActive, password,
      licenseNumber, specialization, assignedChair, employmentType, workSchedule, emergencyContact, notes 
    } = req.body;

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
        is_active = COALESCE($6, is_active),
        license_number = COALESCE($7, license_number),
        specialization = COALESCE($8, specialization),
        assigned_chair = COALESCE($9, assigned_chair),
        employment_type = COALESCE($10, employment_type),
        work_schedule = COALESCE($11, work_schedule),
        emergency_contact = COALESCE($12, emergency_contact),
        notes = COALESCE($13, notes)
    `;
    const params: any[] = [
      fullName ?? existing.full_name,
      role ?? existing.role,
      title ?? existing.title,
      email ?? existing.email,
      phone ?? existing.phone,
      isActive ?? existing.is_active,
      licenseNumber ?? existing.license_number,
      specialization ?? existing.specialization,
      assignedChair ?? existing.assigned_chair,
      employmentType ?? existing.employment_type,
      workSchedule ?? existing.work_schedule,
      emergencyContact ?? existing.emergency_contact,
      notes ?? existing.notes
    ];

    if (password) {
      params.push(hashPassword(password));
      updateSql += `, password_hash = $${params.length}`;
    }

    params.push(id);
    updateSql += ` WHERE id = $${params.length}
      RETURNING 
        id, username, full_name AS "fullName", role, title, email, phone, avatar, is_active AS "isActive",
        license_number AS "licenseNumber", specialization, assigned_chair AS "assignedChair",
        employment_type AS "employmentType", work_schedule AS "workSchedule", emergency_contact AS "emergencyContact", notes,
        created_at AS "createdAt"`;

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
