"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const geoRoutes_js_1 = __importDefault(require("./routes/geoRoutes.js"));
const authRoutes_js_1 = __importDefault(require("./routes/authRoutes.js"));
const certificateRoutes_js_1 = __importDefault(require("./routes/certificateRoutes.js"));
const grievanceRoutes_js_1 = __importDefault(require("./routes/grievanceRoutes.js"));
const taxRoutes_js_1 = __importDefault(require("./routes/taxRoutes.js"));
const contentRoutes_js_1 = __importDefault(require("./routes/contentRoutes.js"));
const voiceCallRoutes_js_1 = __importDefault(require("./ai/voiceCallRoutes.js"));
const adminRoutes_js_1 = __importDefault(require("./routes/adminRoutes.js"));
const rateLimiter_js_1 = require("./middleware/rateLimiter.js");
const authMiddleware_js_1 = require("./middleware/authMiddleware.js");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// 1. Production Security Headers
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'geolocation=(), camera=(), microphone=(self)');
    next();
});
// 2. CORS (Configurable with fallback)
const allowedOrigins = process.env.CORS_ALLOWED_ORIGINS
    ? process.env.CORS_ALLOWED_ORIGINS.split(',').map(s => s.trim())
    : ['*'];
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
            callback(null, true);
        }
        else {
            callback(new Error('Blocked by CORS policy'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-user-id', 'x-user-role'],
    credentials: true
}));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// 3. User Identity Middleware (Tracks authenticated user on every request)
app.use(authMiddleware_js_1.authenticateUser);
// 4. Global General Rate Limiting
app.use(rateLimiter_js_1.generalApiLimiter);
// 5. Request Logger
app.use((req, res, next) => {
    if (req.method !== 'GET') {
        const userRole = req.user?.role || 'guest';
        console.log(`[${new Date().toISOString()}] ⚡ ${req.method} ${req.url} (${userRole})`);
    }
    next();
});
// 6. API Routes with Scoped Limiters & Guards
app.use('/api/geo', geoRoutes_js_1.default);
app.use('/api/auth', rateLimiter_js_1.authRateLimiter, authRoutes_js_1.default);
app.use('/api/certificates', certificateRoutes_js_1.default);
app.use('/api/grievances', grievanceRoutes_js_1.default);
app.use('/api/tax', taxRoutes_js_1.default);
app.use('/api/content', contentRoutes_js_1.default);
app.use('/api/voice', rateLimiter_js_1.voiceRateLimiter, voiceCallRoutes_js_1.default);
app.use('/api/ai/voice', rateLimiter_js_1.voiceRateLimiter, voiceCallRoutes_js_1.default);
app.use('/api/admin', adminRoutes_js_1.default);
// 7. Health & System Status Endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        service: 'Aapli Gram Panchayat Enterprise Backend',
        database: 'SQLite (panchayat.db) with 28,000+ Maharashtra LGD local bodies',
        security: {
            rateLimiting: 'Active (Sliding Window)',
            securityHeaders: 'Active (HSTS, CSP, X-Frame-Options)',
            auditLogging: 'Active (Immutable)',
            rbac: 'Active (Role-Based Access Control)'
        },
        timestamp: new Date().toISOString()
    });
});
// 8. Mobile APK Direct Download Endpoint (Direct Sideloading without Play Store)
app.get(['/apk/Aapli_Grampanchayat.apk', '/api/download/app', '/api/download/app.apk'], (req, res) => {
    const possiblePaths = [
        path_1.default.resolve(process.cwd(), 'public/apk/Aapli_Grampanchayat.apk'),
        path_1.default.resolve(process.cwd(), '../public/apk/Aapli_Grampanchayat.apk'),
        path_1.default.resolve(process.cwd(), '../dist/apk/Aapli_Grampanchayat.apk'),
        path_1.default.resolve(process.cwd(), '../mobile_app/build/app/outputs/flutter-apk/app-release.apk')
    ];
    const foundPath = possiblePaths.find(p => fs_1.default.existsSync(p));
    if (foundPath) {
        res.setHeader('Content-Type', 'application/vnd.android.package-archive');
        res.setHeader('Content-Disposition', 'attachment; filename="Aapli_Grampanchayat.apk"');
        return res.sendFile(foundPath);
    }
    res.status(404).json({
        success: false,
        message: 'APK file not found on server. Please build flutter apk release.'
    });
});
// 9. Production Frontend Static Serving (Unified Fullstack Deployment)
const possibleFrontendPaths = [
    path_1.default.resolve(process.cwd(), '../dist'),
    path_1.default.resolve(process.cwd(), 'dist'),
    path_1.default.resolve(process.cwd(), 'public')
];
const clientDistPath = possibleFrontendPaths.find(p => fs_1.default.existsSync(path_1.default.join(p, 'index.html')));
if (clientDistPath) {
    console.log(`🌐 Serving production frontend bundle from: ${clientDistPath}`);
    app.use(express_1.default.static(clientDistPath));
    app.get('*', (req, res, next) => {
        if (req.url.startsWith('/api') || req.url.startsWith('/apk')) {
            return next();
        }
        res.sendFile(path_1.default.join(clientDistPath, 'index.html'));
    });
}
app.listen(PORT, () => {
    console.log(`
🚀 ========================================================
🏛️  AAPLI GRAM PANCHAYAT - ENTERPRISE BACKEND SERVICE
📡  Server running at: http://localhost:${PORT}
📍  Maharashtra LGD Geo API: http://localhost:${PORT}/api/geo/districts
🔐  Authentication API:     http://localhost:${PORT}/api/auth/users
📄  Certificates API:       http://localhost:${PORT}/api/certificates
💡  Grievances API:         http://localhost:${PORT}/api/grievances
💰  Tax Assessment API:     http://localhost:${PORT}/api/tax
🛡️  Admin & Audit Logs API: http://localhost:${PORT}/api/admin/audit-logs
========================================================
  `);
});
