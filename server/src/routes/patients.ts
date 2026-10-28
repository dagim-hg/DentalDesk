import { Router, Request, Response } from 'express';
import { pool } from '../db/pool.js';

export const patientsRouter = Router();

// GET /api/patients - Get all patients (with search query support)
patientsRouter.get('/', async (req: Request, res: Response) => {
  try {
    const { query } = req.query;
    let sql = 'SELECT * FROM patients ORDER BY updated_at DESC';
    let params: any[] = [];

    if (query && typeof query === 'string' && query.trim() !== '') {
      sql = `
        SELECT * FROM patients 
        WHERE first_name ILIKE $1 
           OR last_name ILIKE $1 
           OR patient_code ILIKE $1 
           OR phone ILIKE $1
        ORDER BY updated_at DESC
      `;
      params = [`%${query.trim()}%`];
    }

    const { rows } = await pool.query(sql, params);
    
    // Map snake_case to camelCase for frontend
    const patients = rows.map(r => ({
      id: r.id,
      patientCode: r.patient_code,
      firstName: r.first_name,
      lastName: r.last_name,
      dob: r.dob,
      gender: r.gender,
      phone: r.phone,
      email: r.email,
      address: r.address,
      emergencyContactName: r.emergency_contact_name,
      emergencyContactPhone: r.emergency_contact_phone,
      nationalId: r.national_id,
      insuranceCarrier: r.insurance_carrier,
      insurancePolicyNumber: r.insurance_policy_number,
      medicalAlerts: r.medical_alerts || [],
      isUrgent: r.is_urgent,
      notes: r.notes,
      version: r.version,
      createdAt: r.created_at,
      updatedAt: r.updated_at
    }));

    res.json(patients);
  } catch (err: any) {
    console.error('Error fetching patients:', err);
    res.status(500).json({ error: 'Failed to fetch patients' });
  }
});

// GET /api/patients/:id - Get single patient
patientsRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query('SELECT * FROM patients WHERE id = $1', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Patient not found' });
    }
    const r = rows[0];
    res.json({
      id: r.id,
      patientCode: r.patient_code,
      firstName: r.first_name,
      lastName: r.last_name,
      dob: r.dob,
      gender: r.gender,
      phone: r.phone,
      email: r.email,
      address: r.address,
      emergencyContactName: r.emergency_contact_name,
      emergencyContactPhone: r.emergency_contact_phone,
      nationalId: r.national_id,
      insuranceCarrier: r.insurance_carrier,
      insurancePolicyNumber: r.insurance_policy_number,
      medicalAlerts: r.medical_alerts || [],
      isUrgent: r.is_urgent,
      notes: r.notes,
      version: r.version,
      createdAt: r.created_at,
      updatedAt: r.updated_at
    });
  } catch (err) {
    console.error('Error fetching patient:', err);
    res.status(500).json({ error: 'Failed to fetch patient' });
  }
});

// POST /api/patients - Create new patient
patientsRouter.post('/', async (req: Request, res: Response) => {
  try {
    const data = req.body;
    
    // Generate unique code if not provided
    const year = new Date().getFullYear();
    const countRes = await pool.query('SELECT COUNT(*) FROM patients');
    const seq = parseInt(countRes.rows[0].count, 10) + 1;
    const patientCode = data.patientCode || `PAT-${year}-${String(seq).padStart(4, '0')}`;

    const sql = `
      INSERT INTO patients (
        patient_code, first_name, last_name, dob, gender, phone, email, address,
        emergency_contact_name, emergency_contact_phone, national_id,
        insurance_carrier, insurance_policy_number, medical_alerts, is_urgent, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      RETURNING *
    `;

    const values = [
      patientCode,
      data.firstName,
      data.lastName,
      data.dob,
      data.gender,
      data.phone,
      data.email || null,
      data.address || null,
      data.emergencyContactName || null,
      data.emergencyContactPhone || null,
      data.nationalId || null,
      data.insuranceCarrier || null,
      data.insurancePolicyNumber || null,
      JSON.stringify(data.medicalAlerts || []),
      data.isUrgent || false,
      data.notes || null
    ];

    const { rows } = await pool.query(sql, values);
    const r = rows[0];

    // Log to audit
    await pool.query(
      `INSERT INTO audit_logs (user_name, action_type, entity_name, entity_id, details)
       VALUES ($1, 'CREATE', 'Patient', $2, $3)`,
      ['Clinic Staff', r.patient_code, `Registered new patient: ${r.first_name} ${r.last_name}`]
    );

    res.status(201).json({
      id: r.id,
      patientCode: r.patient_code,
      firstName: r.first_name,
      lastName: r.last_name,
      dob: r.dob,
      gender: r.gender,
      phone: r.phone,
      email: r.email,
      address: r.address,
      emergencyContactName: r.emergency_contact_name,
      emergencyContactPhone: r.emergency_contact_phone,
      nationalId: r.national_id,
      insuranceCarrier: r.insurance_carrier,
      insurancePolicyNumber: r.insurance_policy_number,
      medicalAlerts: r.medical_alerts || [],
      isUrgent: r.is_urgent,
      notes: r.notes,
      version: r.version,
      createdAt: r.created_at,
      updatedAt: r.updated_at
    });
  } catch (err: any) {
    console.error('Error creating patient:', err);
    res.status(500).json({ error: 'Failed to create patient: ' + err.message });
  }
});

// PUT /api/patients/:id - Update existing patient
patientsRouter.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const sql = `
      UPDATE patients SET
        first_name = COALESCE($1, first_name),
        last_name = COALESCE($2, last_name),
        dob = COALESCE($3, dob),
        gender = COALESCE($4, gender),
        phone = COALESCE($5, phone),
        email = COALESCE($6, email),
        address = COALESCE($7, address),
        emergency_contact_name = COALESCE($8, emergency_contact_name),
        emergency_contact_phone = COALESCE($9, emergency_contact_phone),
        national_id = COALESCE($10, national_id),
        insurance_carrier = COALESCE($11, insurance_carrier),
        insurance_policy_number = COALESCE($12, insurance_policy_number),
        medical_alerts = COALESCE($13, medical_alerts),
        is_urgent = COALESCE($14, is_urgent),
        notes = COALESCE($15, notes),
        version = version + 1,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $16
      RETURNING *
    `;

    const values = [
      data.firstName,
      data.lastName,
      data.dob,
      data.gender,
      data.phone,
      data.email,
      data.address,
      data.emergencyContactName,
      data.emergencyContactPhone,
      data.nationalId,
      data.insuranceCarrier,
      data.insurancePolicyNumber,
      data.medicalAlerts ? JSON.stringify(data.medicalAlerts) : null,
      data.isUrgent !== undefined ? data.isUrgent : null,
      data.notes,
      id
    ];

    const { rows } = await pool.query(sql, values);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Patient not found' });
    }
    const r = rows[0];
    res.json({
      id: r.id,
      patientCode: r.patient_code,
      firstName: r.first_name,
      lastName: r.last_name,
      dob: r.dob,
      gender: r.gender,
      phone: r.phone,
      email: r.email,
      address: r.address,
      emergencyContactName: r.emergency_contact_name,
      emergencyContactPhone: r.emergency_contact_phone,
      nationalId: r.national_id,
      insuranceCarrier: r.insurance_carrier,
      insurancePolicyNumber: r.insurance_policy_number,
      medicalAlerts: r.medical_alerts || [],
      isUrgent: r.is_urgent,
      notes: r.notes,
      version: r.version,
      createdAt: r.created_at,
      updatedAt: r.updated_at
    });
  } catch (err: any) {
    console.error('Error updating patient:', err);
    res.status(500).json({ error: 'Failed to update patient: ' + err.message });
  }
});
