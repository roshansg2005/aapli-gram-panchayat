"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generalApiLimiter = exports.voiceRateLimiter = exports.authRateLimiter = exports.createRateLimiter = void 0;
const ipStore = new Map();
// Cleanup stale rate limit records every 5 minutes
setInterval(() => {
    const now = Date.now();
    for (const [key, record] of ipStore.entries()) {
        if (now > record.resetTime) {
            ipStore.delete(key);
        }
    }
}, 5 * 60 * 1000);
const createRateLimiter = (options) => {
    const { windowMs, maxRequests, message = 'Too many requests. Please try again later.', keyGenerator = (req) => {
        const forwarded = req.headers['x-forwarded-for'];
        const ip = (typeof forwarded === 'string' ? forwarded.split(',')[0] : req.socket.remoteAddress) || 'unknown-ip';
        return `${req.baseUrl || req.path}:${ip}`;
    } } = options;
    return (req, res, next) => {
        const key = keyGenerator(req);
        const now = Date.now();
        const record = ipStore.get(key);
        if (!record || now > record.resetTime) {
            ipStore.set(key, { count: 1, resetTime: now + windowMs });
            res.setHeader('X-RateLimit-Limit', maxRequests);
            res.setHeader('X-RateLimit-Remaining', maxRequests - 1);
            next();
            return;
        }
        if (record.count >= maxRequests) {
            const retryAfterSec = Math.ceil((record.resetTime - now) / 1000);
            res.setHeader('Retry-After', retryAfterSec);
            res.setHeader('X-RateLimit-Limit', maxRequests);
            res.setHeader('X-RateLimit-Remaining', 0);
            res.status(429).json({
                success: false,
                message,
                retryAfter: retryAfterSec
            });
            return;
        }
        record.count++;
        res.setHeader('X-RateLimit-Limit', maxRequests);
        res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - record.count));
        next();
    };
};
exports.createRateLimiter = createRateLimiter;
/**
 * 🔒 Pre-configured Production Limiters
 */
// Strict Auth Limiter: 10 attempts per minute (Prevents OTP / Password brute force & SMS toll fraud)
exports.authRateLimiter = (0, exports.createRateLimiter)({
    windowMs: 60 * 1000,
    maxRequests: 15,
    message: 'खूप जास्त लॉगिन प्रयत्न झाले आहेत. कृपया १ मिनिटानंतर पुन्हा प्रयत्न करा (Too many login attempts. Please wait 1 minute).'
});
// Voice / AI Limiter: 30 calls per minute per IP / caller phone
exports.voiceRateLimiter = (0, exports.createRateLimiter)({
    windowMs: 60 * 1000,
    maxRequests: 30,
    message: 'AI Voice helpline request limit exceeded. Please wait.',
    keyGenerator: (req) => {
        const caller = req.body?.From || req.body?.CallFrom || req.body?.phone || req.ip || 'voice-caller';
        return `voice:${caller}`;
    }
});
// General API Protection Limiter: 300 requests per 5 minutes
exports.generalApiLimiter = (0, exports.createRateLimiter)({
    windowMs: 5 * 60 * 1000,
    maxRequests: 300,
    message: 'API rate limit exceeded. Please slow down.'
});
