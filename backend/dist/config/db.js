"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
const better_sqlite3_1 = __importDefault(require("better-sqlite3"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const dbPath = path_1.default.resolve(process.cwd(), 'data/panchayat.db');
// Ensure directory exists
fs_1.default.mkdirSync(path_1.default.dirname(dbPath), { recursive: true });
exports.db = new better_sqlite3_1.default(dbPath, {
    verbose: process.env.NODE_ENV === 'development' ? undefined : undefined
});
// Enable WAL mode for high concurrency
exports.db.pragma('journal_mode = WAL');
// Execute migrations to ensure all dynamic tables and columns exist
try {
    // 1. Ensure schemes table exists with gram_panchayat scoping
    exports.db.exec(`
    CREATE TABLE IF NOT EXISTS schemes (
      id TEXT PRIMARY KEY,
      name_mr TEXT NOT NULL,
      name_en TEXT NOT NULL,
      category TEXT NOT NULL,
      benefit_mr TEXT NOT NULL,
      benefit_en TEXT NOT NULL,
      eligibility_mr TEXT NOT NULL,
      eligibility_en TEXT NOT NULL,
      documents_mr TEXT NOT NULL,
      documents_en TEXT NOT NULL,
      department_mr TEXT,
      department_en TEXT,
      deadline TEXT,
      gram_panchayat TEXT,
      taluka TEXT,
      district TEXT,
      icon_name TEXT DEFAULT 'ShieldCheck',
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
    // Migrate schemes columns if missing
    const schemeColumns = exports.db.pragma('table_info(schemes)');
    const schemeColNames = schemeColumns.map(c => c.name);
    if (!schemeColNames.includes('gram_panchayat')) {
        exports.db.exec('ALTER TABLE schemes ADD COLUMN gram_panchayat TEXT;');
    }
    if (!schemeColNames.includes('taluka')) {
        exports.db.exec('ALTER TABLE schemes ADD COLUMN taluka TEXT;');
    }
    if (!schemeColNames.includes('district')) {
        exports.db.exec('ALTER TABLE schemes ADD COLUMN district TEXT;');
    }
    // 2. Ensure scheme_applications table exists
    exports.db.exec(`
    CREATE TABLE IF NOT EXISTS scheme_applications (
      id TEXT PRIMARY KEY,
      scheme_id TEXT NOT NULL,
      scheme_name_mr TEXT NOT NULL,
      scheme_name_en TEXT NOT NULL,
      applicant_name TEXT NOT NULL,
      applicant_phone TEXT NOT NULL,
      applicant_aadhaar TEXT,
      ward_no TEXT,
      gram_panchayat TEXT,
      taluka TEXT,
      district TEXT,
      benefit_amount REAL DEFAULT 0,
      status TEXT DEFAULT 'pending',
      applied_date DATE NOT NULL,
      sanctioned_date DATE,
      dbt_status TEXT DEFAULT 'pending'
    );
  `);
    // 3. Migrate notices columns if missing
    const noticeColumns = exports.db.pragma('table_info(notices)');
    const noticeColNames = noticeColumns.map(c => c.name);
    if (!noticeColNames.includes('gram_panchayat')) {
        exports.db.exec('ALTER TABLE notices ADD COLUMN gram_panchayat TEXT;');
    }
    if (!noticeColNames.includes('taluka')) {
        exports.db.exec('ALTER TABLE notices ADD COLUMN taluka TEXT;');
    }
    if (!noticeColNames.includes('district')) {
        exports.db.exec('ALTER TABLE notices ADD COLUMN district TEXT;');
    }
    // 4. Clean out legacy mock notices that had no gram panchayat or had Shivane
    exports.db.exec(`DELETE FROM notices WHERE gram_panchayat IS NULL OR gram_panchayat = '' OR venue LIKE '%शिवणे%';`);
    exports.db.exec(`DELETE FROM projects WHERE gram_panchayat IS NULL OR gram_panchayat = '';`);
    // 5. Migrate projects columns if missing
    const projectColumns = exports.db.pragma('table_info(projects)');
    const projectColNames = projectColumns.map(c => c.name);
    if (!projectColNames.includes('taluka')) {
        exports.db.exec('ALTER TABLE projects ADD COLUMN taluka TEXT;');
    }
    if (!projectColNames.includes('district')) {
        exports.db.exec('ALTER TABLE projects ADD COLUMN district TEXT;');
    }
    // 6. Migrate tax_records columns if missing
    const taxColumns = exports.db.pragma('table_info(tax_records)');
    const taxColNames = taxColumns.map(c => c.name);
    if (!taxColNames.includes('tax_type')) {
        exports.db.exec("ALTER TABLE tax_records ADD COLUMN tax_type TEXT DEFAULT 'all';");
    }
    if (!taxColNames.includes('created_at')) {
        exports.db.exec('ALTER TABLE tax_records ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP;');
    }
    // Ensure users table has address, dob, password and is_active columns
    const userColumns = exports.db.pragma('table_info(users)');
    const userColNames = userColumns.map(c => c.name);
    if (!userColNames.includes('address')) {
        exports.db.exec('ALTER TABLE users ADD COLUMN address TEXT;');
    }
    if (!userColNames.includes('dob')) {
        exports.db.exec('ALTER TABLE users ADD COLUMN dob TEXT;');
    }
    if (!userColNames.includes('password')) {
        exports.db.exec('ALTER TABLE users ADD COLUMN password TEXT;');
    }
    if (!userColNames.includes('is_active')) {
        exports.db.exec('ALTER TABLE users ADD COLUMN is_active INTEGER DEFAULT 1;');
    }
    // Seed default admin if none exists
    const existingAdmin = exports.db.prepare("SELECT id FROM users WHERE role = 'admin' OR email = 'admin@grampanchayat.gov.in'").get();
    if (!existingAdmin) {
        exports.db.prepare(`
      INSERT INTO users (
        id, role, name, phone, email, password, designation, employee_code, is_active, avatar_url
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?)
    `).run('usr-admin-01', 'admin', 'मुख्य प्रशासकीय अधिकारी (Super Admin)', '9999999999', 'admin@grampanchayat.gov.in', 'admin123', 'सिस्टीम ॲडमिनिस्ट्रेटर (System Admin)', 'ADM-HQ-001', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80');
    }
    // 7. Ensure certificates columns exist
    const certColumns = exports.db.pragma('table_info(certificates)');
    const certColNames = certColumns.map(c => c.name);
    if (!certColNames.includes('certificate_number')) {
        exports.db.exec('ALTER TABLE certificates ADD COLUMN certificate_number TEXT;');
    }
    if (!certColNames.includes('processed_date')) {
        exports.db.exec('ALTER TABLE certificates ADD COLUMN processed_date DATE;');
    }
    if (!certColNames.includes('details')) {
        exports.db.exec('ALTER TABLE certificates ADD COLUMN details TEXT;');
    }
    // 8. Ensure certificate_types table exists for dynamic certificate management and fee allocation
    exports.db.exec(`
    CREATE TABLE IF NOT EXISTS certificate_types (
      id TEXT PRIMARY KEY,
      code TEXT NOT NULL,
      gram_panchayat TEXT,
      name_mr TEXT NOT NULL,
      name_en TEXT NOT NULL,
      fee REAL DEFAULT 0,
      delivery_days INTEGER DEFAULT 2,
      description_mr TEXT,
      description_en TEXT,
      required_documents_mr TEXT,
      required_documents_en TEXT,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
    // 9. 💧 Water Schedules Table
    exports.db.exec(`
    CREATE TABLE IF NOT EXISTS water_schedules (
      id TEXT PRIMARY KEY,
      gram_panchayat TEXT NOT NULL,
      taluka TEXT,
      district TEXT,
      ward_no TEXT NOT NULL,
      area_name TEXT,
      morning_time TEXT,
      evening_time TEXT,
      status TEXT DEFAULT 'ON_TIME',
      operator_name TEXT,
      operator_phone TEXT,
      notes_mr TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
    // 10. ⚡ Electricity & MSEDCL Outage Alerts
    exports.db.exec(`
    CREATE TABLE IF NOT EXISTS electricity_alerts (
      id TEXT PRIMARY KEY,
      gram_panchayat TEXT NOT NULL,
      taluka TEXT,
      district TEXT,
      feeder_name TEXT,
      area_name TEXT,
      outage_type TEXT DEFAULT 'SCHEDULED',
      start_time TEXT NOT NULL,
      expected_end_time TEXT,
      reason_mr TEXT,
      lineman_name TEXT,
      lineman_phone TEXT,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
    // 11. 🌾 APMC Mandi Market Rates
    exports.db.exec(`
    CREATE TABLE IF NOT EXISTS apmc_market_rates (
      id TEXT PRIMARY KEY,
      market_name TEXT NOT NULL,
      taluka TEXT,
      district TEXT,
      commodity_name_mr TEXT NOT NULL,
      commodity_name_en TEXT,
      variety TEXT,
      min_price REAL NOT NULL,
      max_price REAL NOT NULL,
      modal_price REAL NOT NULL,
      unit TEXT DEFAULT 'क्विंटल',
      report_date DATE NOT NULL,
      source TEXT DEFAULT 'महाराष्ट्र राज्य कृषी पणन मंडळ (MSAMB)',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
    // 12. 🚨 Emergency Village Directory
    exports.db.exec(`
    CREATE TABLE IF NOT EXISTS emergency_directory (
      id TEXT PRIMARY KEY,
      gram_panchayat TEXT NOT NULL,
      taluka TEXT,
      district TEXT,
      category TEXT NOT NULL,
      designation_mr TEXT NOT NULL,
      person_name TEXT NOT NULL,
      phone TEXT NOT NULL,
      alternate_phone TEXT,
      available_hours TEXT DEFAULT '२४ तास उपलब्ध',
      is_emergency_service INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
    // 13. 📢 Digital Dawandi & Public Broadcasts
    exports.db.exec(`
    CREATE TABLE IF NOT EXISTS digital_dawandi (
      id TEXT PRIMARY KEY,
      gram_panchayat TEXT NOT NULL,
      taluka TEXT,
      district TEXT,
      title_mr TEXT NOT NULL,
      announcement_text TEXT NOT NULL,
      audio_url TEXT,
      priority_level TEXT DEFAULT 'NORMAL',
      issued_by_role TEXT,
      issued_by_name TEXT,
      expiry_date DATE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
    // 14. 🏘️ Gram Sabha Public Agenda & Demands
    exports.db.exec(`
    CREATE TABLE IF NOT EXISTS gramsabha_agenda_demands (
      id TEXT PRIMARY KEY,
      gram_panchayat TEXT NOT NULL,
      taluka TEXT,
      district TEXT,
      citizen_id TEXT,
      citizen_name TEXT NOT NULL,
      citizen_phone TEXT NOT NULL,
      ward_no TEXT,
      topic_title TEXT NOT NULL,
      demand_description TEXT NOT NULL,
      gramsabha_date DATE,
      status TEXT DEFAULT 'SUBMITTED',
      resolution_note TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
    // 15. 🔐 Citizen Document Locker
    exports.db.exec(`
    CREATE TABLE IF NOT EXISTS citizen_document_locker (
      id TEXT PRIMARY KEY,
      citizen_id TEXT,
      citizen_phone TEXT NOT NULL,
      document_type TEXT NOT NULL,
      document_name TEXT NOT NULL,
      reference_id TEXT,
      file_url TEXT,
      qr_verification_code TEXT,
      issued_by TEXT,
      issued_date DATE,
      is_verified INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
    // Clean out unassigned legacy certificate types so only Gram Panchayat specific ones exist
    exports.db.exec("DELETE FROM certificate_types WHERE gram_panchayat IS NULL OR gram_panchayat = '';");
    // 16. ⚡ Create Performance & Multi-Tenant Query Indexes
    exports.db.exec(`
    CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_users_gp ON users(gram_panchayat);
    CREATE INDEX IF NOT EXISTS idx_cert_phone ON certificates(applicant_phone);
    CREATE INDEX IF NOT EXISTS idx_cert_gp ON certificates(gram_panchayat);
    CREATE INDEX IF NOT EXISTS idx_cert_status ON certificates(status);
    CREATE INDEX IF NOT EXISTS idx_tax_prop ON tax_records(property_no);
    CREATE INDEX IF NOT EXISTS idx_tax_gp ON tax_records(gram_panchayat);
    CREATE INDEX IF NOT EXISTS idx_tax_paid ON tax_records(is_paid);
    CREATE INDEX IF NOT EXISTS idx_grievance_phone ON grievances(citizen_phone);
    CREATE INDEX IF NOT EXISTS idx_grievance_gp ON grievances(gram_panchayat);
    CREATE INDEX IF NOT EXISTS idx_voice_phone ON voice_call_logs(caller_phone);
    CREATE INDEX IF NOT EXISTS idx_dawandi_gp ON digital_dawandi(gram_panchayat);
    CREATE INDEX IF NOT EXISTS idx_water_gp ON water_schedules(gram_panchayat);
    CREATE INDEX IF NOT EXISTS idx_apmc_date ON apmc_market_rates(report_date);
  `);
}
catch (migErr) {
    console.warn('DB Migration warning:', migErr);
}
console.log(`✅ Connected to SQLite Database at: ${dbPath}`);
