import { Request, Response, NextFunction } from 'express';
import { db } from '../config/db.js';

export interface AuthenticatedUser {
  id: string;
  role: string;
  name: string;
  phone: string;
  gramPanchayat?: string;
  taluka?: string;
  district?: string;
  wardNo?: string;
}

// Extend Express Request interface
declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

/**
 * 🔐 Authenticate Request
 * Extracts user identity from Authorization header (Bearer token / User ID / API Key)
 * or from session headers (x-user-id / x-user-role)
 */
export const authenticateUser = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;
    const userIdHeader = req.headers['x-user-id'] as string;
    const userRoleHeader = req.headers['x-user-role'] as string;

    let userId: string | null = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7).trim();
      // If token is in format "usr-xxx" or base64 user session
      if (token.startsWith('usr-') || token.startsWith('stf-') || token.startsWith('adm-')) {
        userId = token;
      } else {
        try {
          const decoded = Buffer.from(token, 'base64').toString('utf-8');
          if (decoded.includes(':')) {
            userId = decoded.split(':')[0];
          } else {
            userId = decoded;
          }
        } catch {
          userId = token;
        }
      }
    } else if (userIdHeader) {
      userId = userIdHeader.trim();
    }

    if (userId) {
      const user = db.prepare('SELECT id, role, name, phone, gram_panchayat, taluka, district, ward_no FROM users WHERE id = ?').get(userId) as any;
      if (user) {
        req.user = {
          id: user.id,
          role: user.role,
          name: user.name,
          phone: user.phone,
          gramPanchayat: user.gram_panchayat,
          taluka: user.taluka,
          district: user.district,
          wardNo: user.ward_no
        };
      }
    }

    // Fallback: If development/simulated role header provided
    if (!req.user && userRoleHeader) {
      req.user = {
        id: userId || `anon-${Date.now()}`,
        role: userRoleHeader,
        name: 'Simulated User',
        phone: '0000000000'
      };
    }

    next();
  } catch (err) {
    console.warn('Authentication middleware check note:', err);
    next();
  }
};

/**
 * 🛑 Require Logged-In User
 */
export const requireAuth = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: 'अनधिकृत प्रवेश! कृपया प्रथम लॉगिन करा (Unauthorized: Please login first).'
    });
    return;
  }
  next();
};

/**
 * 🛡️ Role-Based Access Control (RBAC) Guard
 */
export const requireRoles = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'अनधिकृत प्रवेश! कृपया प्रथम लॉगिन करा (Unauthorized: Please login first).'
      });
      return;
    }

    // Admin has superuser access across all modules
    if (req.user.role === 'admin') {
      next();
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: `प्रवेश नाकारला! या कृतीसाठी '${allowedRoles.join(', ')}' अधिकार आवश्यक आहेत (Forbidden: Insufficient permissions for role '${req.user.role}').`
      });
      return;
    }

    next();
  };
};

/**
 * Common Role Guards
 */
export const requireStaffOrAdmin = requireRoles(['sarpanch', 'upsarpanch', 'gram_sevak', 'sadasya', 'clerk', 'taluka_bdo', 'admin']);
export const requireGramPanchayatLeader = requireRoles(['sarpanch', 'upsarpanch', 'gram_sevak', 'admin']);
export const requireBdoOrAdmin = requireRoles(['taluka_bdo', 'admin']);
