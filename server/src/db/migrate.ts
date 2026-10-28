import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool } from './pool.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigration() {
  console.log('🔄 Running database migrations for DentalDesk...');
  try {
    const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
    console.log('📦 Applying schema.sql...');
    await pool.query(schemaSql);
    console.log('✅ Schema tables created successfully.');

    const seedSql = fs.readFileSync(path.join(__dirname, 'seed.sql'), 'utf-8');
    console.log('🌱 Applying seed.sql...');
    await pool.query(seedSql);
    console.log('✅ Seed data inserted successfully.');

    console.log('🎉 DentalDesk database is ready to use!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await pool.end();
  }
}

runMigration();
