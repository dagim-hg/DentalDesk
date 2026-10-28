import { Router, Request, Response } from 'express';
import { pool } from '../db/pool.js';

export const auditRouter = Router();

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
      version: '1.0',
      exportedAt: new Date().toISOString(),
      database: 'dentaldesk',
      tables: {
        patients: patientsRes.rows,
        appointments: appointmentsRes.rows,
        clinicalVisits: visitsRes.rows,
        toothRecords: toothRes.rows,
        serviceCatalog: servicesRes.rows,
        invoices: invoicesRes.rows,
        payments: paymentsRes.rows,
        inventory: inventoryRes.rows,
        auditLogs: auditRes.rows
      }
    };

    // Log the backup action
    await pool.query(
      `INSERT INTO audit_logs (user_name, action_type, entity_name, entity_id, details)
       VALUES ('System Administrator', 'BACKUP_EXPORT', 'Database', 'FULL_SNAPSHOT', 'Exported full database JSON snapshot')`
    );

    res.json(backupSnapshot);
  } catch (err: any) {
    console.error('Error exporting database backup:', err);
    res.status(500).json({ error: 'Failed to export backup: ' + err.message });
  }
});
