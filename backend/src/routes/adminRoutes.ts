import { Router, Request, Response } from 'express';
import { db } from '../config/db.js';
import { requireAuth, requireBdoOrAdmin } from '../middleware/authMiddleware.js';
import { performDatabaseBackup, listBackups } from '../scripts/backupDatabase.js';
import { logAuditEvent } from '../db/auditLog.js';

const router = Router();

// Apply auth & RBAC guards to all admin routes
router.use(requireAuth);
router.use(requireBdoOrAdmin);

/**
 * 📜 Get Audit Logs with pagination and filters
 * GET /api/admin/audit-logs
 */
router.get('/audit-logs', (req: Request, res: Response): void => {
  try {
    const { action, userRole, resourceType, limit = 50, offset = 0 } = req.query;
    let query = 'SELECT * FROM audit_logs WHERE 1=1';
    const params: any[] = [];

    if (action) {
      query += ' AND action = ?';
      params.push(action);
    }
    if (userRole) {
      query += ' AND user_role = ?';
      params.push(userRole);
    }
    if (resourceType) {
      query += ' AND resource_type = ?';
      params.push(resourceType);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(Number(limit), Number(offset));

    const logs = db.prepare(query).all(...params);
    const countRow = db.prepare('SELECT COUNT(*) as total FROM audit_logs').get() as any;

    res.json({
      success: true,
      total: countRow?.total || 0,
      count: logs.length,
      data: logs
    });
  } catch (error: any) {
    console.error('Error fetching audit logs:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve audit logs' });
  }
});

/**
 * 💾 Trigger Instant Database Backup
 * POST /api/admin/backup
 */
router.post('/backup', (req: Request, res: Response): void => {
  try {
    const result = performDatabaseBackup();
    if (result.success) {
      logAuditEvent({
        action: 'DATABASE_BACKUP_CREATED',
        resourceType: 'SYSTEM_BACKUP',
        resourceId: result.backupFile,
        details: { sizeBytes: result.sizeBytes, integrity: result.integrity },
        req
      });
      res.json(result);
    } else {
      res.status(500).json(result);
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Backup failed' });
  }
});

/**
 * 📋 List Available Backups
 * GET /api/admin/backups
 */
router.get('/backups', (req: Request, res: Response): void => {
  try {
    const backups = listBackups();
    res.json({ success: true, count: backups.length, data: backups });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to list backups' });
  }
});

export default router;
