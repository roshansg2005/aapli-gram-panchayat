import fs from 'fs';
import path from 'path';
import { db } from '../config/db.js';

const BACKUP_DIR = path.resolve(process.cwd(), 'backups');

// Ensure backups directory exists
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

export interface BackupResult {
  success: boolean;
  backupFile: string;
  backupPath: string;
  sizeBytes: number;
  integrity: string;
  timestamp: string;
  message?: string;
}

/**
 * 💾 Perform Atomic SQLite Online Backup
 */
export const performDatabaseBackup = (): BackupResult => {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = `panchayat_backup_${timestamp}.db`;
    const backupPath = path.join(BACKUP_DIR, backupFile);

    // 1. Run atomic SQLite online backup using VACUUM INTO
    db.exec(`VACUUM INTO '${backupPath.replace(/'/g, "''")}'`);

    // 2. Check File Stats
    const stats = fs.statSync(backupPath);

    // 3. Verify Integrity
    const integrityRow = db.prepare('PRAGMA integrity_check').get() as any;
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
  } catch (error: any) {
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

/**
 * 🧹 Prune backups older than maxCount
 */
function pruneOldBackups(maxCount: number = 7): void {
  try {
    const files = fs.readdirSync(BACKUP_DIR)
      .filter(f => f.startsWith('panchayat_backup_') && f.endsWith('.db'))
      .map(f => ({
        name: f,
        path: path.join(BACKUP_DIR, f),
        time: fs.statSync(path.join(BACKUP_DIR, f)).mtime.getTime()
      }))
      .sort((a, b) => b.time - a.time);

    if (files.length > maxCount) {
      const toDelete = files.slice(maxCount);
      for (const item of toDelete) {
        fs.unlinkSync(item.path);
        console.log(`🗑️ Pruned old backup: ${item.name}`);
      }
    }
  } catch (err) {
    console.warn('Backup pruning note:', err);
  }
}

/**
 * 📋 List available backups
 */
export const listBackups = () => {
  try {
    if (!fs.existsSync(BACKUP_DIR)) return [];
    return fs.readdirSync(BACKUP_DIR)
      .filter(f => f.startsWith('panchayat_backup_') && f.endsWith('.db'))
      .map(f => {
        const p = path.join(BACKUP_DIR, f);
        const stats = fs.statSync(p);
        return {
          filename: f,
          sizeBytes: stats.size,
          sizeMb: (stats.size / (1024 * 1024)).toFixed(2),
          createdAt: stats.mtime.toISOString()
        };
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch {
    return [];
  }
};
