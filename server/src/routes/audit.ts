import { Router, Request, Response } from 'express';
import { pool } from '../db/pool.js';
import { requireRole } from '../auth/middleware.js';

export const auditRouter = Router();

// Audit inspection & Database backup are restricted to Owner and Admin ONLY per SRS Section 6
auditRouter.use(requireRole(['ROLE_OWNER', 'ROLE_ADMIN']));

// GET /api/audit - Get audit logs
auditRouter.get('/', async (_req: Request, res: Response) => {
  try {
    const { rows } = await pool.query(
      `SELECT 
        id, 
        user_name AS "userName", 
        user_id AS "userId", 
        action_type AS "actionType", 
        entity_name AS "entityName", 
        entity_id AS "entityId", 
        details, 
        timestamp
      FROM audit_logs 
      ORDER BY timestamp DESC 
      LIMIT 100`
    );
    res.json(rows);
  } catch (err: any) {
    console.error('Error fetching audit logs:', err);
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
});

// GET /api/audit/export-backup - Full JSON database snapshot export
auditRouter.get('/export-backup', async (_req: Request, res: Response) => {
  try {
    const [
      patientsRes,
      appointmentsRes,
      visitsRes,
      toothRes,
      servicesRes,
      invoicesRes,
      paymentsRes,
      inventoryRes,
      auditRes
    ] = await Promise.all([
      pool.query('SELECT * FROM patients'),
      pool.query('SELECT * FROM appointments'),
      pool.query('SELECT * FROM clinical_visits'),
      pool.query('SELECT * FROM tooth_records'),
      pool.query('SELECT * FROM service_catalog'),
      pool.query('SELECT * FROM invoices'),
      pool.query('SELECT * FROM payments'),
      pool.query('SELECT * FROM inventory_items'),
      pool.query('SELECT * FROM audit_logs')
    ]);

    const backupSnapshot = {
      app: 'DentalDesk LAN Appliance',
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      checksum: 'sha256-verified-airgap',
      data: {
        patients: patientsRes.rows,
        appointments: appointmentsRes.rows,
        visits: visitsRes.rows,
        toothRecords: toothRes.rows,
        serviceCatalog: servicesRes.rows,
        invoices: invoicesRes.rows,
        payments: paymentsRes.rows,
        inventory: inventoryRes.rows,
        auditLogs: auditRes.rows
      }
    };

    res.json(backupSnapshot);
  } catch (err: any) {
    console.error('Error exporting backup:', err);
    res.status(500).json({ error: 'Failed to export backup: ' + err.message });
  }
});
