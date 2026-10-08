"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireBdoOrAdmin = exports.requireGramPanchayatLeader = exports.requireStaffOrAdmin = exports.requireRoles = exports.requireAuth = exports.authenticateUser = void 0;
const db_js_1 = require("../config/db.js");
/**
 * 🔐 Authenticate Request
 * Extracts user identity from Authorization header (Bearer token / User ID / API Key)
 * or from session headers (x-user-id / x-user-role)
 */
const authenticateUser = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const userIdHeader = req.headers['x-user-id'];
        const userRoleHeader = req.headers['x-user-role'];
        let userId = null;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7).trim();
            // If token is in format "usr-xxx" or base64 user session
            if (token.startsWith('usr-') || token.startsWith('stf-') || token.startsWith('adm-')) {
                userId = token;
            }
            else {
                try {
                    const decoded = Buffer.from(token, 'base64').toString('utf-8');
                    if (decoded.includes(':')) {
                        userId = decoded.split(':')[0];
                    }
                    else {
                        userId = decoded;
                    }
                }
                catch {
                    userId = token;
                }
            }
        }
        else if (userIdHeader) {
            userId = userIdHeader.trim();
        }
        if (userId) {
            const user = db_js_1.db.prepare('SELECT id, role, name, phone, gram_panchayat, taluka, district, ward_no FROM users WHERE id = ?').get(userId);
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
    }
    catch (err) {
        console.warn('Authentication middleware check note:', err);
        next();
    }
};
exports.authenticateUser = authenticateUser;
/**
 * 🛑 Require Logged-In User
 */
const requireAuth = (req, res, next) => {
    if (!req.user) {
        res.status(401).json({
            success: false,
            message: 'अनधिकृत प्रवेश! कृपया प्रथम लॉगिन करा (Unauthorized: Please login first).'
        });
        return;
    }
    next();
};
exports.requireAuth = requireAuth;
/**
 * 🛡️ Role-Based Access Control (RBAC) Guard
 */
const requireRoles = (allowedRoles) => {
    return (req, res, next) => {
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
exports.requireRoles = requireRoles;
/**
 * Common Role Guards
 */
exports.requireStaffOrAdmin = (0, exports.requireRoles)(['sarpanch', 'upsarpanch', 'gram_sevak', 'sadasya', 'clerk', 'taluka_bdo', 'admin']);
exports.requireGramPanchayatLeader = (0, exports.requireRoles)(['sarpanch', 'upsarpanch', 'gram_sevak', 'admin']);
exports.requireBdoOrAdmin = (0, exports.requireRoles)(['taluka_bdo', 'admin']);
