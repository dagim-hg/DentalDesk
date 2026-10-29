import { Router, Request, Response } from 'express';
import { pool } from '../db/pool.js';
import { requireAuth, requireRole } from '../auth/middleware.js';

export const billingRouter = Router();

// GET /api/billing/services - Get service catalog (all authenticated staff)
billingRouter.get('/services', requireAuth, async (_req: Request, res: Response) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, code AS "serviceCode", name, category, standard_fee AS "defaultPrice", active AS "isActive" FROM service_catalog WHERE active = true ORDER BY id ASC'
    );
    res.json(rows);
  } catch (err: any) {
    console.error('Error fetching service catalog:', err);
    res.status(500).json({ error: 'Failed to fetch services' });
  }
});

// PUT /api/billing/services/:id - Update standard service fee (Owner/Manager ONLY)
billingRouter.put('/services/:id', requireRole(['ROLE_OWNER', 'ROLE_ADMIN']), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { defaultPrice, name, category, isActive } = req.body;

    const { rows } = await pool.query(
      `UPDATE service_catalog 
       SET standard_fee = COALESCE($1, standard_fee),
           name = COALESCE($2, name),
           category = COALESCE($3, category),
           active = COALESCE($4, active)
       WHERE id = $5
       RETURNING id, code AS "serviceCode", name, category, standard_fee AS "defaultPrice", active AS "isActive"`,
      [defaultPrice, name, category, isActive, id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Service not found' });
    }

    const updated = rows[0];
    const actorName = req.user?.fullName || 'Clinic Owner';
    const actorId = req.user?.id || null;

    await pool.query(
      `INSERT INTO audit_logs (user_id, user_name, action_type, entity_name, entity_id, details)
       VALUES ($1, $2, 'UPDATE', 'ServiceCatalog', $3, $4)`,
      [actorId, actorName, id, `Updated service fee for ${updated.name} to $${updated.defaultPrice}`]
    );

    res.json(updated);
  } catch (err: any) {
    console.error('Error updating service fee:', err);
    res.status(500).json({ error: 'Failed to update service fee' });
  }
});

// GET /api/billing/invoices - Get invoices
billingRouter.get('/invoices', requireAuth, async (_req: Request, res: Response) => {
  try {
    const { rows } = await pool.query(`
      SELECT 
        i.id,
        i.patient_id AS "patientId",
        i.invoice_number AS "invoiceNumber",
        i.subtotal,
        i.tax_amount AS "taxAmount",
        i.discount_amount AS "discountAmount",
        i.total_amount AS "totalAmount",
        i.balance_due AS "balanceDue",
        (i.total_amount - i.balance_due) AS "paidAmount",
        i.status,
        i.items,
        i.version,
        i.created_at AS "createdAt",
        p.first_name AS "patientFirstName",
        p.last_name AS "patientLastName",
        p.patient_code AS "patientCode"
      FROM invoices i
      JOIN patients p ON i.patient_id = p.id
      ORDER BY i.created_at DESC
    `);
    res.json(rows);
  } catch (err: any) {
    console.error('Error fetching invoices:', err);
    res.status(500).json({ error: 'Failed to fetch invoices' });
  }
});

// POST /api/billing/invoices - Create new invoice (Owner & Receptionist ONLY)
billingRouter.post('/invoices', requireRole(['ROLE_OWNER', 'ROLE_RECEPTIONIST', 'ROLE_ADMIN']), async (req: Request, res: Response) => {
  try {
    const data = req.body;
    const year = new Date().getFullYear();
    const countRes = await pool.query('SELECT COUNT(*) FROM invoices');
    const seq = parseInt(countRes.rows[0].count, 10) + 1;
    const invoiceNumber = `INV-${year}-${String(seq).padStart(4, '0')}`;

    const subtotal = Number(data.subtotal || 0);
    const taxAmount = Number(data.taxAmount || 0);
    const discountAmount = Number(data.discountAmount || 0);
    const totalAmount = subtotal + taxAmount - discountAmount;
    const balanceDue = totalAmount;

    const sql = `
      INSERT INTO invoices (
        patient_id, invoice_number, subtotal, tax_amount, discount_amount,
        total_amount, balance_due, status, items
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;

    const values = [
      data.patientId,
      invoiceNumber,
      subtotal,
      taxAmount,
      discountAmount,
      totalAmount,
      balanceDue,
      'UNPAID',
      JSON.stringify(data.items || [])
    ];

    const { rows } = await pool.query(sql, values);
    const r = rows[0];

    // Audit log
    const actorName = req.user?.fullName || 'Cashier';
    const actorId = req.user?.id || null;
    await pool.query(
      `INSERT INTO audit_logs (user_id, user_name, action_type, entity_name, entity_id, details)
       VALUES ($1, $2, 'CREATE', 'Invoice', $3, $4)`,
      [actorId, actorName, r.invoice_number, `Generated invoice for patient ID ${r.patient_id} total $${totalAmount}`]
    );

    res.status(201).json({
      id: r.id,
      patientId: r.patient_id,
      invoiceNumber: r.invoice_number,
      subtotal: Number(r.subtotal),
      taxAmount: Number(r.tax_amount),
      discountAmount: Number(r.discount_amount),
      totalAmount: Number(r.total_amount),
      balanceDue: Number(r.balance_due),
      paidAmount: 0,
      status: r.status,
      items: r.items,
      version: r.version,
      createdAt: r.created_at
    });
  } catch (err: any) {
    console.error('Error creating invoice:', err);
    res.status(500).json({ error: 'Failed to create invoice: ' + err.message });
  }
});

// GET /api/billing/payments - Get all payments (Owner & Receptionist ONLY)
billingRouter.get('/payments', requireRole(['ROLE_OWNER', 'ROLE_RECEPTIONIST', 'ROLE_ADMIN']), async (_req: Request, res: Response) => {
  try {
    const { rows } = await pool.query(`
      SELECT 
        p.id,
        p.invoice_id AS "invoiceId",
        p.patient_id AS "patientId",
        p.receipt_number AS "receiptNumber",
        p.amount_paid AS "amount",
        p.payment_method AS "paymentMethod",
        p.transaction_reference AS "transactionReference",
        p.notes,
        p.recorded_by AS "receivedBy",
        p.created_at AS "paymentDate"
      FROM payments p
      ORDER BY p.created_at DESC
    `);
    res.json(rows);
  } catch (err: any) {
    console.error('Error fetching payments:', err);
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
});

// POST /api/billing/payments - Record a payment (Owner & Receptionist ONLY)
billingRouter.post('/payments', requireRole(['ROLE_OWNER', 'ROLE_RECEPTIONIST', 'ROLE_ADMIN']), async (req: Request, res: Response) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const data = req.body;

    const year = new Date().getFullYear();
    const countRes = await client.query('SELECT COUNT(*) FROM payments');
    const seq = parseInt(countRes.rows[0].count, 10) + 1;
    const receiptNumber = `RCPT-${year}-${String(seq).padStart(4, '0')}`;
    const amount = Number(data.amount || 0);

    const actorName = req.user?.fullName || data.receivedBy || 'Front Desk Cashier';
    const actorId = req.user?.id || null;

    const paymentSql = `
      INSERT INTO payments (
        invoice_id, patient_id, receipt_number, amount_paid,
        payment_method, transaction_reference, notes, recorded_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;
    const paymentValues = [
      data.invoiceId,
      data.patientId,
      receiptNumber,
      amount,
      data.paymentMethod || 'CASH',
      data.transactionReference || null,
      data.notes || null,
      actorName
    ];
    const paymentRes = await client.query(paymentSql, paymentValues);
    const p = paymentRes.rows[0];

    // Update invoice balance
    const invoiceRes = await client.query('SELECT * FROM invoices WHERE id = $1', [data.invoiceId]);
    if (invoiceRes.rows.length > 0) {
      const inv = invoiceRes.rows[0];
      const newBalance = Math.max(0, Number(inv.balance_due) - amount);
      const newStatus = newBalance <= 0 ? 'PAID' : 'PARTIALLY_PAID';

      await client.query(
        `UPDATE invoices SET balance_due = $1, status = $2, version = version + 1 WHERE id = $3`,
        [newBalance, newStatus, inv.id]
      );
    }

    // Audit log
    await client.query(
      `INSERT INTO audit_logs (user_id, user_name, action_type, entity_name, entity_id, details)
       VALUES ($1, $2, 'PAYMENT', 'Payment', $3, $4)`,
      [actorId, actorName, receiptNumber, `Collected $${amount} via ${data.paymentMethod} for invoice ${data.invoiceId}`]
    );

    await client.query('COMMIT');

    res.status(201).json({
      id: p.id,
      invoiceId: p.invoice_id,
      patientId: p.patient_id,
      receiptNumber: p.receipt_number,
      amount: Number(p.amount_paid),
      paymentMethod: p.payment_method,
      transactionReference: p.transaction_reference,
      notes: p.notes,
      receivedBy: p.recorded_by,
      paymentDate: p.created_at
    });
  } catch (err: any) {
    await client.query('ROLLBACK');
    console.error('Error recording payment:', err);
    res.status(500).json({ error: 'Failed to record payment: ' + err.message });
  } finally {
    client.release();
  }
});
