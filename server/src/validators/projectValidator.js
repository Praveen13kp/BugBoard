import AppError from '../utils/AppError.js';
import { requireObjectId, requireString } from '../utils/validation.js';

const KEY_PATTERN = /^[A-Z0-9_-]+$/;

function resolveMembers(rawMembers) {
  if (rawMembers === undefined || rawMembers === null) return [];
  if (!Array.isArray(rawMembers)) {
    throw new AppError('Members must be an array of user identifiers.', 422, 'VALIDATION_ERROR');
  }

  return [...new Set(rawMembers.map((member) => requireObjectId(member, 'Member')))];
}

export function validateCreateProject(body = {}) {
  const name = requireString(body.name, 'Project name', { min: 2, max: 120 });
  const key = requireString(body.key, 'Project key', { min: 2, max: 12 }).toUpperCase();
  if (!KEY_PATTERN.test(key)) {
    throw new AppError('Project key may only contain letters, numbers, dashes and underscores.', 422, 'VALIDATION_ERROR');
  }

  const description = requireString(body.description, 'Project description', { min: 0, max: 2000, required: false }) ?? '';
  return { name, key, description, memberIds: resolveMembers(body.members) };
}

export function validateUpdateProject(body = {}) {
  const updates = {};

  if (body.name !== undefined) updates.name = requireString(body.name, 'Project name', { min: 2, max: 120 });
  if (body.description !== undefined) {
    updates.description = requireString(body.description, 'Project description', { min: 0, max: 2000, required: false }) ?? '';
  }
  if (body.key !== undefined) {
    const key = requireString(body.key, 'Project key', { min: 2, max: 12 }).toUpperCase();
    if (!KEY_PATTERN.test(key)) {
      throw new AppError('Project key may only contain letters, numbers, dashes and underscores.', 422, 'VALIDATION_ERROR');
    }
    updates.key = key;
  }

  if (Object.keys(updates).length === 0) {
    throw new AppError('Provide at least one field to update.', 422, 'VALIDATION_ERROR');
  }

  return updates;
}

export function validateAddMembers(body = {}) {
  const memberIds = resolveMembers(body.members);
  if (memberIds.length === 0) {
    throw new AppError('Provide at least one member identifier.', 422, 'VALIDATION_ERROR');
  }

  return memberIds;
}