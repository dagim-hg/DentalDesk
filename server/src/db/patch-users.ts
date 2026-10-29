import { pool } from './pool.js';
import { hashPassword } from '../auth/jwt.js';

async function patchUsers() {
  console.log('🔄 Checking users table schema...');
  try {
    await pool.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255),
      ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
    `);
    console.log('✅ users columns updated.');

    const defaultPasswords: Record<string, string> = {
      'dr.chen': 'Dentist@123',
      'elena.r': 'Reception@123',
      'chloe.k': 'Assistant@123',
      'marcus.v': 'Owner@123'
    };

    for (const [username, pass] of Object.entries(defaultPasswords)) {
      const hash = hashPassword(pass);
      await pool.query(
        'UPDATE users SET password_hash = $1, is_active = true WHERE username = $2',
        [hash, username]
      );
    }
    console.log('✅ User password hashes initialized successfully.');
  } catch (err) {
    console.error('❌ Error patching users:', err);
  } finally {
    await pool.end();
  }
}

patchUsers();
