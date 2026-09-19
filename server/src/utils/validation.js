import AppError from './AppError.js';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const OBJECT_ID_PATTERN = /^[0-9a-fA-F]{24}$/;

export function requireString(value, field, { min, max, required = true } = {}) {
  if (value === undefined || value === null) {
    if (!required) return undefined;
    throw new AppError(`${field} is required.`, 422, 'VALIDATION_ERROR');
  }

  if (typeof value !== 'string') {
    throw new AppError(`${field} must be a string.`, 422, 'VALIDATION_ERROR');
  }

  const trimmed = value.trim();
  if (trimmed.length < min || trimmed.length > max) {
    throw new AppError(`${field} must be between ${min} and ${max} characters.`, 422, 'VALIDATION_ERROR');
  }

  return trimmed;
}

export function requireObjectId(value, field) {
  if (!OBJECT_ID_PATTERN.test(String(value))) {
    throw new AppError(`${field} must be a valid identifier.`, 422, 'VALIDATION_ERROR');
  }

  return String(value);
}

export function requireOptionalObjectId(value, field) {
  if (value === undefined || value === null || value === '') return null;
  return requireObjectId(value, field);
}

export function requireEnum(value, field, allowed) {
  if (!allowed.includes(value)) {
    throw new AppError(`${field} must be one of: ${allowed.join(', ')}.`, 422, 'VALIDATION_ERROR');
  }

  return value;
}

export function requireOptionalEnum(value, field, allowed) {
  if (value === undefined || value === null || value === '') return undefined;
  return requireEnum(value, field, allowed);
}

export function isValidEmail(email) {
  return EMAIL_PATTERN.test(email);
}

export function isObjectId(value) {
  return OBJECT_ID_PATTERN.test(String(value ?? ''));
}