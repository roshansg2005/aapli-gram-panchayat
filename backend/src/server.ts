import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import geoRoutes from './routes/geoRoutes.js';
import authRoutes from './routes/authRoutes.js';
import certificateRoutes from './routes/certificateRoutes.js';
import grievanceRoutes from './routes/grievanceRoutes.js';
import taxRoutes from './routes/taxRoutes.js';
import contentRoutes from './routes/contentRoutes.js';
import voiceCallRoutes from './ai/voiceCallRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

import { authRateLimiter, voiceRateLimiter, generalApiLimiter } from './middleware/rateLimiter.js';
import { authenticateUser } from './middleware/authMiddleware.js';

dotenv.config();

const app = express();
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

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Blocked by CORS policy'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-user-id', 'x-user-role'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 3. User Identity Middleware (Tracks authenticated user on every request)
app.use(authenticateUser);

// 4. Global General Rate Limiting
app.use(generalApiLimiter);

// 5. Request Logger
app.use((req, res, next) => {
  if (req.method !== 'GET') {
    const userRole = req.user?.role || 'guest';
    console.log(`[${new Date().toISOString()}] ⚡ ${req.method} ${req.url} (${userRole})`);
  }
  next();
});

// 6. API Routes with Scoped Limiters & Guards
app.use('/api/geo', geoRoutes);
app.use('/api/auth', authRateLimiter, authRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/grievances', grievanceRoutes);
app.use('/api/tax', taxRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/voice', voiceRateLimiter, voiceCallRoutes);
app.use('/api/ai/voice', voiceRateLimiter, voiceCallRoutes);
app.use('/api/admin', adminRoutes);

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
    path.resolve(process.cwd(), 'public/apk/Aapli_Grampanchayat.apk'),
    path.resolve(process.cwd(), '../public/apk/Aapli_Grampanchayat.apk'),
    path.resolve(process.cwd(), '../dist/apk/Aapli_Grampanchayat.apk'),
    path.resolve(process.cwd(), '../mobile_app/build/app/outputs/flutter-apk/app-release.apk')
  ];

  const foundPath = possiblePaths.find(p => fs.existsSync(p));

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
  path.resolve(process.cwd(), '../dist'),
  path.resolve(process.cwd(), 'dist'),
  path.resolve(process.cwd(), 'public')
];

const clientDistPath = possibleFrontendPaths.find(p => fs.existsSync(path.join(p, 'index.html')));

if (clientDistPath) {
  console.log(`🌐 Serving production frontend bundle from: ${clientDistPath}`);
  app.use(express.static(clientDistPath));

  app.get('*', (req, res, next) => {
    if (req.url.startsWith('/api') || req.url.startsWith('/apk')) {
      return next();
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
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
