import { requireString } from '../utils/validation.js';

export function validateComment(body = {}) {
  return requireString(body.content, 'Content', { min: 1, max: 5000 });
}