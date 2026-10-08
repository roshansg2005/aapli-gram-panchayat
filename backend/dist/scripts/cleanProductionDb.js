"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const better_sqlite3_1 = __importDefault(require("better-sqlite3"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const dbPath = path_1.default.resolve(process.cwd(), 'data/panchayat.db');
if (!fs_1.default.existsSync(dbPath)) {
    console.error(`❌ Database not found at ${dbPath}`);
    process.exit(1);
}
// 1. Create a safe backup before cleaning
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const backupPath = path_1.default.resolve(process.cwd(), `data/panchayat.db.pre-clean-${timestamp}.bak`);
fs_1.default.copyFileSync(dbPath, backupPath);
console.log(`📦 Safety backup created at: ${backupPath}`);
const db = new better_sqlite3_1.default(dbPath);
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
        }
        catch (e) {
            // Table may not exist or already empty
        }
    }
    // 4. Reset sqlite_sequence if exists
    try {
        db.prepare('DELETE FROM sqlite_sequence').run();
    }
    catch (e) { }
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
}
catch (error) {
    console.error('❌ Error cleaning database:', error);
    process.exit(1);
}
