import AppError from '../utils/AppError.js';
import { USER_ROLES } from '../utils/enums.js';
import { isValidEmail, requireString } from '../utils/validation.js';

const PUBLIC_ROLES = USER_ROLES.filter((role) => role !== 'ADMIN');

function resolveEmail(body = {}) {
  const email = requireString(body.email, 'Email', { min: 3, max: 254 }).toLowerCase();
  if (!isValidEmail(email)) {
    throw new AppError('Email must be a valid email address.', 422, 'VALIDATION_ERROR');
  }

  return email;
}

export function validateRegistration(body = {}) {
  const name = requireString(body.name, 'Name', { min: 2, max: 100 });
  const email = resolveEmail(body);
  const password = requireString(body.password, 'Password', { min: 8, max: 128 });
  const role = body.role || 'TESTER';

  if (!PUBLIC_ROLES.includes(role)) {
    throw new AppError('Public registration cannot create an administrator account.', 403, 'ROLE_NOT_ALLOWED');
  }

  return { name, email, password, role };
}

export function validateLogin(body = {}) {
  const email = resolveEmail(body);
  const password = requireString(body.password, 'Password', { min: 1, max: 128 });

  return { email, password };
}