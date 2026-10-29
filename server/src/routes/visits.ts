import { Router, Request, Response } from 'express';
import { pool } from '../db/pool.js';
import { requireAuth, requireRole } from '../auth/middleware.js';

export const visitsRouter = Router();

// Protect all clinical visit routes - Receptionist has NO access to clinical records per SRS Section 6
visitsRouter.use(requireRole(['ROLE_OWNER', 'ROLE_DENTIST', 'ROLE_ASSISTANT', 'ROLE_ADMIN']));

// GET /api/visits - Get visits (optional filter ?patientId=123)
visitsRouter.get('/', async (req: Request, res: Response) => {
  try {
    const { patientId } = req.query;
    let sql = 'SELECT * FROM clinical_visits ORDER BY visit_datetime DESC';
    let params: any[] = [];

    if (patientId) {
      sql = 'SELECT * FROM clinical_visits WHERE patient_id = $1 ORDER BY visit_datetime DESC';
      params = [patientId];
    }

    const { rows } = await pool.query(sql, params);

    // Fetch tooth records for each visit
    const visits = await Promise.all(rows.map(async (v) => {
      const toothRes = await pool.query(
        'SELECT * FROM tooth_records WHERE visit_id = $1',
        [v.id]
      );
      return {
        id: v.id,
        appointmentId: v.appointment_id,
        patientId: v.patient_id,
        dentistId: v.dentist_id,
        visitDatetime: v.visit_datetime,
        chiefComplaint: v.chief_complaint,
        clinicalNotes: v.clinical_notes,
        diagnosis: v.diagnosis,
        treatmentPlan: v.treatment_plan,
        prescriptions: v.prescriptions,
        toothRecords: toothRes.rows.map(tr => ({
          toothNumber: tr.tooth_number,
          condition: tr.condition,
          surfaces: tr.surfaces || [],
          notes: tr.notes,
          diagnosedDate: tr.diagnosed_date,
          procedureCode: tr.procedure_code
        })),
        createdAt: v.created_at
      };
    }));

    res.json(visits);
  } catch (err: any) {
    console.error('Error fetching clinical visits:', err);
    res.status(500).json({ error: 'Failed to fetch visits' });
  }
});

// GET /api/visits/odontogram/:patientId - Get all consolidated tooth records for a patient
visitsRouter.get('/odontogram/:patientId', async (req: Request, res: Response) => {
  try {
    const { patientId } = req.params;
    const sql = `
      SELECT DISTINCT ON (tooth_number)
        tooth_number AS "toothNumber",
        condition,
        surfaces,
        notes,
        diagnosed_date AS "diagnosedDate",
        procedure_code AS "procedureCode"
      FROM tooth_records
      WHERE patient_id = $1
      ORDER BY tooth_number, created_at DESC
    `;
    const { rows } = await pool.query(sql, [patientId]);
    res.json(rows);
  } catch (err: any) {
    console.error('Error fetching patient odontogram:', err);
    res.status(500).json({ error: 'Failed to fetch odontogram' });
  }
});

// POST /api/visits - Save clinical visit (Dentist or Owner ONLY per SRS)
visitsRouter.post('/', requireRole(['ROLE_DENTIST', 'ROLE_OWNER']), async (req: Request, res: Response) => {
  const client = await pool.connect();
  try {
    const data = req.body;
    await client.query('BEGIN');

    const visitSql = `
      INSERT INTO clinical_visits (
        appointment_id, patient_id, dentist_id, visit_datetime,
        chief_complaint, clinical_notes, diagnosis, treatment_plan, prescriptions
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;
    const visitValues = [
      data.appointmentId || null,
      data.patientId,
      data.dentistId || (req.user ? req.user.id : null),
      data.visitDatetime || new Date().toISOString(),
      data.chiefComplaint || '',
      data.clinicalNotes || '',
      data.diagnosis || '',
      data.treatmentPlan || '',
      data.prescriptions || ''
    ];

    const visitResult = await client.query(visitSql, visitValues);
    const newVisit = visitResult.rows[0];

    // Insert tooth records if any
    const savedToothRecords: any[] = [];
    if (Array.isArray(data.toothRecords) && data.toothRecords.length > 0) {
      for (const tr of data.toothRecords) {
        const trSql = `
          INSERT INTO tooth_records (
            visit_id, patient_id, tooth_number, condition, surfaces, notes, diagnosed_date, procedure_code
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          RETURNING *
        `;
        const trValues = [
          newVisit.id,
          data.patientId,
          tr.toothNumber,
          tr.condition,
          JSON.stringify(tr.surfaces || []),
          tr.notes || null,
          tr.diagnosedDate || new Date().toISOString().split('T')[0],
          tr.procedureCode || null
        ];
        const trResult = await client.query(trSql, trValues);
        savedToothRecords.push({
          toothNumber: trResult.rows[0].tooth_number,
          condition: trResult.rows[0].condition,
          surfaces: trResult.rows[0].surfaces,
          notes: trResult.rows[0].notes,
          diagnosedDate: trResult.rows[0].diagnosed_date,
          procedureCode: trResult.rows[0].procedure_code
        });
      }
    }

    // Audit log
    const actorName = req.user ? req.user.fullName : 'Authorized Clinician';
    const actorId = req.user ? req.user.id : null;
    await client.query(
      `INSERT INTO audit_logs (user_id, user_name, action_type, entity_name, entity_id, details)
       VALUES ($1, $2, 'CREATE', 'ClinicalVisit', $3, $4)`,
      [actorId, actorName, newVisit.id, `Saved clinical visit SOAP notes & updated ${savedToothRecords.length} tooth records for patient #${data.patientId}`]
    );

    await client.query('COMMIT');

    res.status(201).json({
      id: newVisit.id,
      appointmentId: newVisit.appointment_id,
      patientId: newVisit.patient_id,
      dentistId: newVisit.dentist_id,
      visitDatetime: newVisit.visit_datetime,
      chiefComplaint: newVisit.chief_complaint,
      clinicalNotes: newVisit.clinical_notes,
      diagnosis: newVisit.diagnosis,
      treatmentPlan: newVisit.treatment_plan,
      prescriptions: newVisit.prescriptions,
      toothRecords: savedToothRecords,
      createdAt: newVisit.created_at
    });
  } catch (err: any) {
    await client.query('ROLLBACK');
    console.error('Error saving clinical visit:', err);
    res.status(500).json({ error: 'Failed to save visit: ' + err.message });
  } finally {
    client.release();
  }
});
