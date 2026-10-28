import { Router, Request, Response } from 'express';
import { pool } from '../db/pool.js';

export const appointmentsRouter = Router();

// GET /api/appointments - Get all appointments
appointmentsRouter.get('/', async (_req: Request, res: Response) => {
  try {
    const { rows } = await pool.query(`
      SELECT 
        a.id,
        a.patient_id AS "patientId",
        a.dentist_id AS "dentistId",
        a.scheduled_start AS "scheduledStart",
        a.duration_minutes AS "durationMinutes",
        a.status,
        a.is_walkin AS "isWalkin",
        a.is_urgent AS "isUrgent",
        a.chief_complaint AS "chiefComplaint",
        a.operatory_chair AS "operatoryChair",
        a.cancellation_reason AS "cancellationReason",
        a.version,
        a.created_at AS "createdAt",
        p.first_name AS "patientFirstName",
        p.last_name AS "patientLastName",
        p.patient_code AS "patientCode"
      FROM appointments a
      JOIN patients p ON a.patient_id = p.id
      ORDER BY a.scheduled_start ASC
    `);
    res.json(rows);
  } catch (err: any) {
    console.error('Error fetching appointments:', err);
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
});

// POST /api/appointments - Book appointment
appointmentsRouter.post('/', async (req: Request, res: Response) => {
  try {
    const data = req.body;
    const sql = `
      INSERT INTO appointments (
        patient_id, dentist_id, scheduled_start, duration_minutes,
        status, is_walkin, is_urgent, chief_complaint, operatory_chair
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;
    const values = [
      data.patientId,
      data.dentistId || null,
      data.scheduledStart,
      data.durationMinutes || 30,
      data.status || 'SCHEDULED',
      data.isWalkin || false,
      data.isUrgent || false,
      data.chiefComplaint || '',
      data.operatoryChair || 'Chair 1 (Operatory A)'
    ];

    const { rows } = await pool.query(sql, values);
    const r = rows[0];

    // Audit log
    await pool.query(
      `INSERT INTO audit_logs (user_name, action_type, entity_name, entity_id, details)
       VALUES ($1, 'CREATE', 'Appointment', $2, $3)`,
      ['Clinic Staff', r.id, `Booked appointment for patient ID ${r.patient_id} at ${r.scheduled_start}`]
    );

    res.status(201).json({
      id: r.id,
      patientId: r.patient_id,
      dentistId: r.dentist_id,
      scheduledStart: r.scheduled_start,
      durationMinutes: r.duration_minutes,
      status: r.status,
      isWalkin: r.is_walkin,
      isUrgent: r.is_urgent,
      chiefComplaint: r.chief_complaint,
      operatoryChair: r.operatory_chair,
      version: r.version,
      createdAt: r.created_at
    });
  } catch (err: any) {
    console.error('Error booking appointment:', err);
    res.status(500).json({ error: 'Failed to book appointment: ' + err.message });
  }
});

// PATCH /api/appointments/:id/status - Update appointment status (Queue transitions)
appointmentsRouter.patch('/:id/status', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const { rows } = await pool.query(
      `UPDATE appointments 
       SET status = $1, version = version + 1 
       WHERE id = $2 
       RETURNING *`,
      [status, id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    const r = rows[0];

    // Audit log status change
    await pool.query(
      `INSERT INTO audit_logs (user_name, action_type, entity_name, entity_id, details)
       VALUES ($1, 'STATUS_CHANGE', 'Appointment', $2, $3)`,
      ['Clinic Staff', r.id, `Changed appointment status to ${status}`]
    );

    res.json({
      id: r.id,
      patientId: r.patient_id,
      dentistId: r.dentist_id,
      scheduledStart: r.scheduled_start,
      durationMinutes: r.duration_minutes,
      status: r.status,
      isWalkin: r.is_walkin,
      isUrgent: r.is_urgent,
      chiefComplaint: r.chief_complaint,
      operatoryChair: r.operatory_chair,
      version: r.version,
      createdAt: r.created_at
    });
  } catch (err: any) {
    console.error('Error updating appointment status:', err);
    res.status(500).json({ error: 'Failed to update appointment status' });
  }
});
