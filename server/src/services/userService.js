import User from '../models/User.js';

export async function listUsers() {
  return User.find().sort({ name: 1 }).select('name email role').lean();
}