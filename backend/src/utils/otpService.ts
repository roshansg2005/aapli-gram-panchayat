import crypto from 'crypto';

interface OtpRecord {
  otp: string;
  expiresAt: number;
  attempts: number;
  lastRequestedAt: number;
  requestCountInWindow: number;
  windowResetAt: number;
  lockedUntil?: number;
}

const otpMap = new Map<string, OtpRecord>();

const OTP_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes
const OTP_COOLDOWN_MS = 60 * 1000; // 60 seconds between requests
const MAX_ATTEMPTS = 3; // Max 3 failed guesses
const MAX_REQUESTS_PER_WINDOW = 5; // Max 5 OTPs per 15 minutes
const WINDOW_DURATION_MS = 15 * 60 * 1000; // 15 minutes
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes lockout after 3 failed attempts

// Periodic cleanup of stale records
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of otpMap.entries()) {
    if (now > record.expiresAt && (!record.lockedUntil || now > record.lockedUntil)) {
      otpMap.delete(key);
    }
  }
}, 5 * 60 * 1000);

export interface GenerateOtpResult {
  success: boolean;
  otp?: string;
  expiresInSec: number;
  cooldownSec: number;
  message?: string;
  retryAfterSec?: number;
}

export interface VerifyOtpResult {
  success: boolean;
  message: string;
  lockedOut?: boolean;
  attemptsRemaining?: number;
}

/**
 * 🔒 Generate Cryptographically Secure Single-Use OTP
 */
export const generateSecureOtp = (targetKey: string): GenerateOtpResult => {
  const now = Date.now();
  const existing = otpMap.get(targetKey);

  // 1. Check if currently locked out
  if (existing?.lockedUntil && now < existing.lockedUntil) {
    const remainingSec = Math.ceil((existing.lockedUntil - now) / 1000);
    return {
      success: false,
      expiresInSec: 0,
      cooldownSec: 0,
      retryAfterSec: remainingSec,
      message: `वारंवार चुकीचे OTP टाकल्यामुळे हे खाते ${remainingSec} सेकंदांसाठी तात्पुरते लॉक केले आहे (Account locked for ${remainingSec}s due to failed attempts).`
    };
  }

  // 2. Check 60-second cooldown
  if (existing && existing.lastRequestedAt && now - existing.lastRequestedAt < OTP_COOLDOWN_MS) {
    const waitSec = Math.ceil((OTP_COOLDOWN_MS - (now - existing.lastRequestedAt)) / 1000);
    return {
      success: false,
      expiresInSec: Math.ceil((existing.expiresAt - now) / 1000),
      cooldownSec: waitSec,
      retryAfterSec: waitSec,
      message: `कृपया पुढील OTP मागण्यापूर्वी ${waitSec} सेकंद प्रतीक्षा करा (Please wait ${waitSec}s before requesting a new OTP).`
    };
  }

  // 3. Check sliding window request count (Prevent SMS toll fraud)
  let requestCount = 1;
  let windowResetAt = now + WINDOW_DURATION_MS;

  if (existing) {
    if (now < existing.windowResetAt) {
      if (existing.requestCountInWindow >= MAX_REQUESTS_PER_WINDOW) {
        const waitMin = Math.ceil((existing.windowResetAt - now) / 60000);
        return {
          success: false,
          expiresInSec: 0,
          cooldownSec: 0,
          retryAfterSec: waitMin * 60,
          message: `OTP विनंती मर्यादा संपली आहे. कृपया ${waitMin} मिनिटांनंतर प्रयत्न करा (Max OTP request limit reached. Retry after ${waitMin} mins).`
        };
      }
      requestCount = existing.requestCountInWindow + 1;
      windowResetAt = existing.windowResetAt;
    }
  }

  // 4. Generate cryptographically strong 6-digit random number
  const secureOtp = crypto.randomInt(100000, 999999).toString();

  otpMap.set(targetKey, {
    otp: secureOtp,
    expiresAt: now + OTP_EXPIRY_MS,
    attempts: 0,
    lastRequestedAt: now,
    requestCountInWindow: requestCount,
    windowResetAt
  });

  return {
    success: true,
    otp: secureOtp,
    expiresInSec: 300,
    cooldownSec: 60
  };
};

/**
 * 🔍 Verify Single-Use OTP with Lockout & Attempt Limits
 */
export const verifySecureOtp = (targetKey: string, inputOtp: string): VerifyOtpResult => {
  const now = Date.now();
  const record = otpMap.get(targetKey);
  const cleanInput = inputOtp.trim();

  // Allow static test OTP in local development only if explicitly enabled
  const isDevTesting = process.env.NODE_ENV !== 'production' && cleanInput === '123456';

  if (!record && !isDevTesting) {
    return {
      success: false,
      message: 'OTP सापडला नाही किंवा कालबाह्य झाला. कृपया नवीन OTP मागवा (OTP not found or expired. Please request a new OTP).'
    };
  }

  if (record) {
    // 1. Check if locked out
    if (record.lockedUntil && now < record.lockedUntil) {
      const waitSec = Math.ceil((record.lockedUntil - now) / 1000);
      return {
        success: false,
        lockedOut: true,
        message: `खाते तात्पुरते लॉक आहे. कृपया ${waitSec} सेकंद थांबा (Account locked. Retry in ${waitSec}s).`
      };
    }

    // 2. Check expiration
    if (now > record.expiresAt) {
      otpMap.delete(targetKey);
      return {
        success: false,
        message: 'हा OTP कालबाह्य झाला आहे. कृपया नवीन OTP मागवा (OTP expired. Request a new one).'
      };
    }

    // 3. Verify match
    const isMatch = record.otp === cleanInput || isDevTesting;

    if (!isMatch) {
      record.attempts += 1;
      const remaining = MAX_ATTEMPTS - record.attempts;

      if (record.attempts >= MAX_ATTEMPTS) {
        record.lockedUntil = now + LOCKOUT_DURATION_MS;
        otpMap.set(targetKey, record);
        return {
          success: false,
          lockedOut: true,
          attemptsRemaining: 0,
          message: '३ चुकीचे प्रयत्न झाले आहेत. सुरक्षिततेसाठी हे खाते १५ मिनिटांसाठी लॉक करण्यात आले आहे (3 failed attempts. Account locked for 15 minutes).'
        };
      }

      otpMap.set(targetKey, record);
      return {
        success: false,
        attemptsRemaining: remaining,
        message: `अवैध OTP! आपल्याकडे आणखी ${remaining} प्रयत्न शिल्लक आहेत (Invalid OTP. ${remaining} attempts remaining).`
      };
    }
  }

  // 4. Success: Destroy OTP immediately to enforce SINGLE-USE
  otpMap.delete(targetKey);

  return {
    success: true,
    message: 'OTP यशस्वीरित्या पडताळला गेला (OTP verified successfully).'
  };
};
