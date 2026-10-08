"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listBackups = exports.performDatabaseBackup = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const db_js_1 = require("../config/db.js");
const BACKUP_DIR = path_1.default.resolve(process.cwd(), 'backups');
// Ensure backups directory exists
if (!fs_1.default.existsSync(BACKUP_DIR)) {
    fs_1.default.mkdirSync(BACKUP_DIR, { recursive: true });
}
/**
 * 💾 Perform Atomic SQLite Online Backup
 */
const performDatabaseBackup = () => {
    try {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupFile = `panchayat_backup_${timestamp}.db`;
        const backupPath = path_1.default.join(BACKUP_DIR, backupFile);
        // 1. Run atomic SQLite online backup using VACUUM INTO
        db_js_1.db.exec(`VACUUM INTO '${backupPath.replace(/'/g, "''")}'`);
        // 2. Check File Stats
        const stats = fs_1.default.statSync(backupPath);
        // 3. Verify Integrity
        const integrityRow = db_js_1.db.prepare('PRAGMA integrity_check').get();
        const integrity = integrityRow?.integrity_check || 'ok';
        // 4. Prune Old Backups (Keep latest 7 backups)
        pruneOldBackups(7);
        return {
            success: true,
            backupFile,
            backupPath,
            sizeBytes: stats.size,
            integrity,
            timestamp: new Date().toISOString(),
            message: `Database backup completed successfully (${(stats.size / (1024 * 1024)).toFixed(2)} MB)`
        };
    }
    catch (error) {
        console.error('Database backup error:', error);
        return {
            success: false,
            backupFile: '',
            backupPath: '',
            sizeBytes: 0,
            integrity: 'error',
            timestamp: new Date().toISOString(),
            message: error.message || 'Backup failed'
        };
    }
};
exports.performDatabaseBackup = performDatabaseBackup;
/**
 * 🧹 Prune backups older than maxCount
 */
function pruneOldBackups(maxCount = 7) {
    try {
        const files = fs_1.default.readdirSync(BACKUP_DIR)
            .filter(f => f.startsWith('panchayat_backup_') && f.endsWith('.db'))
            .map(f => ({
            name: f,
            path: path_1.default.join(BACKUP_DIR, f),
            time: fs_1.default.statSync(path_1.default.join(BACKUP_DIR, f)).mtime.getTime()
        }))
            .sort((a, b) => b.time - a.time);
        if (files.length > maxCount) {
            const toDelete = files.slice(maxCount);
            for (const item of toDelete) {
                fs_1.default.unlinkSync(item.path);
                console.log(`🗑️ Pruned old backup: ${item.name}`);
            }
        }
    }
    catch (err) {
        console.warn('Backup pruning note:', err);
    }
}
/**
 * 📋 List available backups
 */
const listBackups = () => {
    try {
        if (!fs_1.default.existsSync(BACKUP_DIR))
            return [];
        return fs_1.default.readdirSync(BACKUP_DIR)
            .filter(f => f.startsWith('panchayat_backup_') && f.endsWith('.db'))
            .map(f => {
            const p = path_1.default.join(BACKUP_DIR, f);
            const stats = fs_1.default.statSync(p);
            return {
                filename: f,
                sizeBytes: stats.size,
                sizeMb: (stats.size / (1024 * 1024)).toFixed(2),
                createdAt: stats.mtime.toISOString()
            };
        })
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    catch {
        return [];
    }
};
exports.listBackups = listBackups;
