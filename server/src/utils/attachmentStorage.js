import path from 'node:path';
import fs from 'node:fs';
import crypto from 'node:crypto';
import multer from 'multer';
import env from '../config/env.js';
import AppError from '../utils/AppError.js';

export const MAX_ATTACHMENT_BYTES = 5 * 1024 * 1024;

export const ALLOWED_MIME_TYPES = new Set([
  'image/png',
  'image/jpeg',
  'image/gif',
  'image/webp',
  'application/pdf',
  'text/plain',
  'text/markdown',
  'application/json',
  'application/zip',
]);

const EXTENSION_BY_MIME = {
  'image/png': '.png',
  'image/jpeg': '.jpg',
  'image/gif': '.gif',
  'image/webp': '.webp',
  'application/pdf': '.pdf',
  'text/plain': '.txt',
  'text/markdown': '.md',
  'application/json': '.json',
  'application/zip': '.zip',
};

export function uploadDirectory() {
  const uploadDir = path.resolve(process.cwd(), env.uploadDir);
  fs.mkdirSync(uploadDir, { recursive: true });
  return uploadDir;
}

export function filePathFor(storedName) {
  if (!storedName || typeof storedName !== 'string' || storedName.includes('..') || storedName.includes('/') || storedName.includes('\\')) {
    throw new AppError('Invalid file reference.', 400, 'INVALID_FILE_REFERENCE');
  }
  return path.join(uploadDirectory(), storedName);
}

export function safeOriginalName(name = '') {
  const sanitized = name.replace(/[^\w.\- ]+/gi, '').trim().slice(0, 200);
  return sanitized || 'attachment';
}

export const upload = multer({
  storage: multer.diskStorage({
    destination: uploadDirectory,
    filename: (_request, file, callback) => {
      const extension = EXTENSION_BY_MIME[file.mimetype] || '';
      const storedName = `${crypto.randomUUID()}${extension}`;
      callback(null, storedName);
    },
  }),
  limits: { fileSize: MAX_ATTACHMENT_BYTES },
  fileFilter: (_request, file, callback) => {
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      callback(new AppError('Unsupported file type.', 415, 'UNSUPPORTED_FILE_TYPE'));
      return;
    }
    callback(null, true);
  },
});

export function removeStoredFile(storedName) {
  try {
    fs.unlinkSync(filePathFor(storedName));
  } catch {
    // Best effort cleanup; the database record is the source of truth.
  }
}

export function isImage(mimeType) {
  return String(mimeType || '').startsWith('image/');
}

export function createUploadsPlaceholder() {
  const dir = uploadDirectory();
  const placeholder = path.join(dir, '.gitkeep');
  if (!fs.existsSync(placeholder)) {
    fs.writeFileSync(placeholder, 'Uploaded files are stored here. This directory is never committed.\n');
  }
  return { dir };
}