import mongoose from 'mongoose';
import env from './env.js';

export async function connectDatabase() {
  if (!env.mongoUri) {
    throw new Error('MONGODB_URI must be configured before starting the server.');
  }

  await mongoose.connect(env.mongoUri);
}
