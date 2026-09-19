import mongoose from 'mongoose';
import env from '../src/config/env.js';
import { runSeed, SEED_CREDENTIALS, SEED_PASSWORD } from '../src/seed/seed.js';

if (!env.mongoUri) {
  console.error('MONGODB_URI must be configured before seeding. See .env.example.');
  process.exit(1);
}

try {
  await mongoose.connect(env.mongoUri);
  const stats = await runSeed();
  console.log('Seed complete:', JSON.stringify(stats));

  console.log('\nDemo accounts (password for all):');
  for (const credential of SEED_CREDENTIALS) {
    console.log(`  ${credential.role.padEnd(9)} ${credential.name.padEnd(12)} ${credential.email}`);
  }
  console.log(`  (password)  ${SEED_PASSWORD}`);
} catch (error) {
  console.error('Seed failed:', error);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}