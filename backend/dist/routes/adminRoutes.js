"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_js_1 = require("../config/db.js");
const authMiddleware_js_1 = require("../middleware/authMiddleware.js");
const backupDatabase_js_1 = require("../scripts/backupDatabase.js");
const auditLog_js_1 = require("../db/auditLog.js");
const router = (0, express_1.Router)();
// Apply auth & RBAC guards to all admin routes
router.use(authMiddleware_js_1.requireAuth);
router.use(authMiddleware_js_1.requireBdoOrAdmin);
/**
 * 📜 Get Audit Logs with pagination and filters
 * GET /api/admin/audit-logs
 */
router.get('/audit-logs', (req, res) => {
    try {
        const { action, userRole, resourceType, limit = 50, offset = 0 } = req.query;
        let query = 'SELECT * FROM audit_logs WHERE 1=1';
        const params = [];
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
        const logs = db_js_1.db.prepare(query).all(...params);
        const countRow = db_js_1.db.prepare('SELECT COUNT(*) as total FROM audit_logs').get();
        res.json({
            success: true,
            total: countRow?.total || 0,
            count: logs.length,
            data: logs
        });
    }
    catch (error) {
        console.error('Error fetching audit logs:', error);
        res.status(500).json({ success: false, message: 'Failed to retrieve audit logs' });
    }
});
/**
 * 💾 Trigger Instant Database Backup
 * POST /api/admin/backup
 */
router.post('/backup', (req, res) => {
    try {
        const result = (0, backupDatabase_js_1.performDatabaseBackup)();
        if (result.success) {
            (0, auditLog_js_1.logAuditEvent)({
                action: 'DATABASE_BACKUP_CREATED',
                resourceType: 'SYSTEM_BACKUP',
                resourceId: result.backupFile,
                details: { sizeBytes: result.sizeBytes, integrity: result.integrity },
                req
            });
            res.json(result);
        }
        else {
            res.status(500).json(result);
        }
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message || 'Backup failed' });
    }
});
/**
 * 📋 List Available Backups
 * GET /api/admin/backups
 */
router.get('/backups', (req, res) => {
    try {
        const backups = (0, backupDatabase_js_1.listBackups)();
        res.json({ success: true, count: backups.length, data: backups });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to list backups' });
    }
});
exports.default = router;
