import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { authenticate } from './auth/middleware.js';
import { authRouter } from './routes/auth.js';
import { usersRouter } from './routes/users.js';
import { reportsRouter } from './routes/reports.js';
import { patientsRouter } from './routes/patients.js';
import { appointmentsRouter } from './routes/appointments.js';
import { visitsRouter } from './routes/visits.js';
import { billingRouter } from './routes/billing.js';
import { inventoryRouter } from './routes/inventory.js';
import { auditRouter } from './routes/audit.js';
import { pool } from './db/pool.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '5000', 10);

// Middlewares
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());

// Global authentication extractor (populates req.user if Bearer token present)
app.use('/api', authenticate);

// Request logging
app.use((req, _res, next) => {
  const userTag = req.user ? ` [${req.user.role}:${req.user.username}]` : ' [Guest]';
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}${userTag}`);
  next();
});

// Health check endpoint
app.get('/api/health', async (_req, res) => {
  try {
    const dbRes = await pool.query('SELECT NOW()');
    res.json({
      status: 'UP',
      app: 'DentalDesk LAN Server',
      database: 'PostgreSQL 18 Connected',
      timestamp: dbRes.rows[0].now
    });
  } catch (err: any) {
    res.status(503).json({
      status: 'DEGRADED',
      database: 'Disconnected',
      error: err.message
    });
  }
});

// Mount Routes
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/reports', reportsRouter);
app.use('/api/patients', patientsRouter);
app.use('/api/appointments', appointmentsRouter);
app.use('/api/visits', visitsRouter);
app.use('/api/billing', billingRouter);
app.use('/api/inventory', inventoryRouter);
app.use('/api/audit', auditRouter);

// Start listening on 0.0.0.0 for LAN access
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 DentalDesk Server running on:`);
  console.log(`   - Local:   http://localhost:${PORT}`);
  console.log(`   - LAN:     http://0.0.0.0:${PORT}`);
  console.log(`   - Health:  http://localhost:${PORT}/api/health`);
});
