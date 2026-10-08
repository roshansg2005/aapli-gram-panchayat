import path from 'path';

export interface FileValidationResult {
  isValid: boolean;
  sanitizedFilename: string;
  error?: string;
}

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf'
]);

const ALLOWED_EXTENSIONS = new Set([
  '.jpg',
  '.jpeg',
  '.png',
  '.webp',
  '.pdf'
]);

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

/**
 * 🔍 Inspect Binary Magic Bytes to prevent Executable / Script Spoofing
 */
export const verifyMagicBytes = (buffer: Buffer, extension: string): boolean => {
  if (!buffer || buffer.length < 4) return false;

  const ext = extension.toLowerCase();

  // Dangerous script/executable signatures
  // Windows MZ header
  if (buffer[0] === 0x4D && buffer[1] === 0x5A) return false;
  // Linux ELF binary
  if (buffer[0] === 0x7F && buffer[1] === 0x45 && buffer[2] === 0x4C && buffer[3] === 0x46) return false;
  // HTML / XML / SVG / PHP script header
  const headerStr = buffer.slice(0, 100).toString('utf-8').toLowerCase();
  if (headerStr.includes('<?php') || headerStr.includes('<script') || headerStr.includes('<!doctype html') || headerStr.includes('<html') || headerStr.includes('<svg')) {
    return false;
  }

  // Verify legitimate file formats
  if (ext === '.pdf') {
    // %PDF- (0x25 0x50 0x44 0x46 0x2D)
    return buffer[0] === 0x25 && buffer[1] === 0x50 && buffer[2] === 0x44 && buffer[3] === 0x46;
  }
  if (ext === '.png') {
    // \x89PNG (0x89 0x50 0x4E 0x47)
    return buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47;
  }
  if (ext === '.jpg' || ext === '.jpeg') {
    // JPEG SOI (0xFF 0xD8 0xFF)
    return buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF;
  }
  if (ext === '.webp') {
    // RIFF....WEBP (0x52 0x49 0x46 0x46)
    return buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46;
  }

  return false;
};

/**
 * 📁 Sanitize and Validate Uploaded Files
 */
export const validateFileUpload = (
  filename: string,
  mimetype: string,
  sizeBytes: number,
  buffer?: Buffer
): FileValidationResult => {
  // 1. File Size Check
  if (sizeBytes > MAX_FILE_SIZE_BYTES) {
    return {
      isValid: false,
      sanitizedFilename: '',
      error: `File size exceeds the 5MB limit (${(sizeBytes / (1024 * 1024)).toFixed(2)} MB).`
    };
  }

  // 2. MIME Type Check
  const normalizedMime = mimetype.toLowerCase().trim();
  if (!ALLOWED_MIME_TYPES.has(normalizedMime)) {
    return {
      isValid: false,
      sanitizedFilename: '',
      error: `Invalid file format '${mimetype}'. Allowed formats: JPG, PNG, WEBP, PDF.`
    };
  }

  // 3. Extension Check
  const ext = path.extname(filename).toLowerCase();
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    return {
      isValid: false,
      sanitizedFilename: '',
      error: `Forbidden file extension '${ext}'.`
    };
  }

  // 4. Magic Bytes Inspection
  if (buffer && !verifyMagicBytes(buffer, ext)) {
    return {
      isValid: false,
      sanitizedFilename: '',
      error: `Corrupted or invalid file signature detected for extension '${ext}'.`
    };
  }

  // 5. Path Traversal & Special Character Sanitization
  const baseName = path.basename(filename, ext);
  const cleanBase = baseName.replace(/[^a-zA-Z0-9_\u0900-\u097F-]/g, '_').substring(0, 50);
  const sanitizedFilename = `doc_${Date.now()}_${cleanBase}${ext}`;

  return {
    isValid: true,
    sanitizedFilename
  };
};
