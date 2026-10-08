import { Request } from 'express';
import { db } from '../config/db.js';

// Ensure audit_logs table exists
try {
  db.exec(`
    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      user_name TEXT,
      user_role TEXT,
      user_phone TEXT,
      action TEXT NOT NULL,
      resource_type TEXT NOT NULL,
      resource_id TEXT,
      details_json TEXT,
      ip_address TEXT,
      user_agent TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_audit_created_at ON audit_logs(created_at);
    CREATE INDEX IF NOT EXISTS idx_audit_user_id ON audit_logs(user_id);
    CREATE INDEX IF NOT EXISTS idx_audit_action ON audit_logs(action);
  `);
} catch (err) {
  console.warn('Audit logs table initialization check:', err);
}

export interface AuditEventParams {
  userId?: string;
  userName?: string;
  userRole?: string;
  userPhone?: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  details?: Record<string, any>;
  req?: Request;
}

export const logAuditEvent = (params: AuditEventParams): void => {
  try {
    const {
      userId = params.req?.user?.id || 'SYSTEM',
      userName = params.req?.user?.name || 'Anonymous / System',
      userRole = params.req?.user?.role || 'system',
      userPhone = params.req?.user?.phone || 'N/A',
      action,
      resourceType,
      resourceId = null,
      details = {},
      req
    } = params;

    const forwarded = req?.headers['x-forwarded-for'];
    const ipAddress = (typeof forwarded === 'string' ? forwarded.split(',')[0] : req?.socket?.remoteAddress) || '127.0.0.1';
    const userAgent = (req?.headers['user-agent'] || 'Unknown').substring(0, 255);
    const id = `aud-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    db.prepare(`
      INSERT INTO audit_logs (
        id, user_id, user_name, user_role, user_phone, 
        action, resource_type, resource_id, details_json, 
        ip_address, user_agent, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `).run(
      id,
      userId,
      userName,
      userRole,
      userPhone,
      action,
      resourceType,
      resourceId,
      JSON.stringify(details),
      ipAddress,
      userAgent
    );
  } catch (err) {
    console.error('Failed to write audit log:', err);
  }
};
