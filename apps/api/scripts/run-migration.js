/**
 * Run initial DB migration. Requires DATABASE_URL.
 * Usage: from repo root: node apps/api/scripts/run-migration.js
 * Or from apps/api: npm run migrate (if migrate script uses correct path to db)
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../../.env') });

const { runMigration, pool } = require('../src/db');

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL is not set');
    process.exit(1);
  }
  try {
    await runMigration();
    console.log('Migration completed.');
  } catch (err) {
    console.error('Migration failed:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
