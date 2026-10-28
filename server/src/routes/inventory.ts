import { Router, Request, Response } from 'express';
import { pool } from '../db/pool.js';

export const inventoryRouter = Router();

// GET /api/inventory - Get all inventory items
inventoryRouter.get('/', async (_req: Request, res: Response) => {
  try {
    const { rows } = await pool.query(
      `SELECT 
        id, 
        item_code AS "sku", 
        name, 
        category, 
        current_stock AS "currentStock", 
        unit AS "unitOfMeasure", 
        reorder_threshold AS "reorderThreshold", 
        unit_cost AS "unitCost", 
        location
      FROM inventory_items 
      ORDER BY id ASC`
    );
    res.json(rows);
  } catch (err: any) {
    console.error('Error fetching inventory:', err);
    res.status(500).json({ error: 'Failed to fetch inventory' });
  }
});

// PATCH /api/inventory/:id/stock - Update stock level
inventoryRouter.patch('/:id/stock', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { newStock } = req.body;

    const { rows } = await pool.query(
      `UPDATE inventory_items 
       SET current_stock = $1, last_restocked_at = CURRENT_TIMESTAMP 
       WHERE id = $2 
       RETURNING id, item_code AS "sku", name, category, current_stock AS "currentStock", unit AS "unitOfMeasure", reorder_threshold AS "reorderThreshold", unit_cost AS "unitCost"`,
      [newStock, id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Inventory item not found' });
    }

    const r = rows[0];

    // Audit log
    await pool.query(
      `INSERT INTO audit_logs (user_name, action_type, entity_name, entity_id, details)
       VALUES ($1, 'UPDATE', 'Inventory', $2, $3)`,
      ['Clinic Staff', r.sku, `Updated stock for ${r.name} to ${newStock}`]
    );

    res.json(r);
  } catch (err: any) {
    console.error('Error updating inventory stock:', err);
    res.status(500).json({ error: 'Failed to update stock' });
  }
});
