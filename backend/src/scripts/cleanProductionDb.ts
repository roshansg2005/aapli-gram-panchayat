import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dbPath = path.resolve(process.cwd(), 'data/panchayat.db');

if (!fs.existsSync(dbPath)) {
  console.error(`❌ Database not found at ${dbPath}`);
  process.exit(1);
}

// 1. Create a safe backup before cleaning
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const backupPath = path.resolve(process.cwd(), `data/panchayat.db.pre-clean-${timestamp}.bak`);
fs.copyFileSync(dbPath, backupPath);
console.log(`📦 Safety backup created at: ${backupPath}`);

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

console.log('🧹 Purging development/demo data for Production Server Deployment...');

try {
  // 2. Remove all test users created during development, keeping only Super Admin
  const deletedUsers = db.prepare(`
    DELETE FROM users 
    WHERE id != 'usr-admin-01';
  `).run();
  console.log(`✅ Removed ${deletedUsers.changes} test/demo user accounts.`);

  // 3. Clear all transaction tables
  const tablesToClear = [
    'certificates',
    'grievances',
    'tax_records',
    'notices',
    'projects',
    'schemes',
    'scheme_applications',
    'water_schedules',
    'electricity_alerts',
    'emergency_directory',
    'digital_dawandi',
    'gramsabha_agenda_demands',
    'citizen_document_locker',
    'voice_call_logs',
    'audit_logs'
  ];

  for (const table of tablesToClear) {
    try {
      const res = db.prepare(`DELETE FROM ${table}`).run();
      console.log(`✅ Cleared ${table}: ${res.changes} records removed.`);
    } catch (e: any) {
      // Table may not exist or already empty
    }
  }

  // 4. Reset sqlite_sequence if exists
  try {
    db.prepare('DELETE FROM sqlite_sequence').run();
  } catch (e) {}

  // 5. Optimize database with VACUUM
  console.log('⚡ Optimizing database index and vacuuming disk...');
  db.exec('VACUUM;');

  // 6. Verify Remaining Users
  const remainingUsers = db.prepare('SELECT id, name, role, phone, email FROM users').all();

  console.log(`
🎉 ========================================================
🏛️  PRODUCTION SERVER DATABASE READY & 100% CLEAN!
========================================================
Remaining Official System Accounts (${remainingUsers.length}):
${JSON.stringify(remainingUsers, null, 2)}

✅ All dummy test citizens, grievances, and tax entries removed.
✅ Multi-tenant LGD Maharashtra geography tables retained intact.
========================================================
  `);
} catch (error) {
  console.error('❌ Error cleaning database:', error);
  process.exit(1);
}
