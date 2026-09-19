import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import env from '../config/env.js';
import User from '../models/User.js';
import AppError from '../utils/AppError.js';

const SALT_ROUNDS = 12;

function jwtSecret() {
  if (!env.jwtSecret) {
    throw new AppError('JWT authentication is not configured.', 500, 'JWT_NOT_CONFIGURED');
  }

  return env.jwtSecret;
}

export async function registerUser({ name, email, password, role }) {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError('An account with this email already exists.', 409, 'EMAIL_IN_USE');
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  return User.create({ name, email, passwordHash, role });
}

export async function authenticateUser({ email, password }) {
  const user = await User.findOne({ email }).select('+passwordHash');
  const passwordMatches = user && (await bcrypt.compare(password, user.passwordHash));

  if (!passwordMatches) {
    throw new AppError('Email or password is incorrect.', 401, 'INVALID_CREDENTIALS');
  }

  return user;
}

export function createAccessToken(user) {
  return jwt.sign({ sub: user.id }, jwtSecret(), { expiresIn: env.jwtExpiresIn });
}

export async function getAuthenticatedUser(token) {
  let payload;
  const secret = jwtSecret();

  try {
    payload = jwt.verify(token, secret);
  } catch {
    throw new AppError('Authentication token is invalid or expired.', 401, 'INVALID_TOKEN');
  }

  const user = await User.findById(payload.sub);
  if (!user) {
    throw new AppError('The authenticated user no longer exists.', 401, 'USER_NOT_FOUND');
  }

  return user;
}
