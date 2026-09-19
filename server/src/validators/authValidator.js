import AppError from '../utils/AppError.js';
import { USER_ROLES } from '../utils/enums.js';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PUBLIC_ROLES = USER_ROLES.filter((role) => role !== 'ADMIN');

function requireString(value, field, { min, max }) {
  if (typeof value !== 'string') {
    throw new AppError(`${field} is required.`, 422, 'VALIDATION_ERROR');
  }

  const trimmed = value.trim();
  if (trimmed.length < min || trimmed.length > max) {
    throw new AppError(`${field} must be between ${min} and ${max} characters.`, 422, 'VALIDATION_ERROR');
  }

  return trimmed;
}

export function validateRegistration(body = {}) {
  const name = requireString(body.name, 'Name', { min: 2, max: 100 });
  const email = requireString(body.email, 'Email', { min: 3, max: 254 }).toLowerCase();
  const password = requireString(body.password, 'Password', { min: 8, max: 128 });
  const role = body.role || 'TESTER';

  if (!EMAIL_PATTERN.test(email)) {
    throw new AppError('Email must be a valid email address.', 422, 'VALIDATION_ERROR');
  }

  if (!PUBLIC_ROLES.includes(role)) {
    throw new AppError('Public registration cannot create an administrator account.', 403, 'ROLE_NOT_ALLOWED');
  }

  return { name, email, password, role };
}

export function validateLogin(body = {}) {
  const email = requireString(body.email, 'Email', { min: 3, max: 254 }).toLowerCase();
  const password = requireString(body.password, 'Password', { min: 1, max: 128 });

  if (!EMAIL_PATTERN.test(email)) {
    throw new AppError('Email must be a valid email address.', 422, 'VALIDATION_ERROR');
  }

  return { email, password };
}
