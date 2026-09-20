// Dev-only launcher: runs the full BugBoard API against an in-memory MongoDB,
// requiring no local MongoDB install and no .env file. Great for a quick demo
// or local development. Run from server/ with:  npm run dev:memory
// Then from client/ (second terminal):          npm run dev
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongod;
let server;

async function stop() {
  if (server) await new Promise((resolve) => server.close(resolve));
  if (mongod) await mongod.stop();
  process.exit(0);
}

async function main() {
  mongod = await MongoMemoryServer.create();
  // Env must be set before the config module is imported.
  process.env.MONGODB_URI = mongod.getUri('bugboard');
  process.env.JWT_SECRET = process.env.JWT_SECRET || 'dev-in-memory-secret-change-me';
  process.env.CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

  const { connectDatabase } = await import('../src/config/database.js');
  // const { default: connectDatabase } = await import('../src/config/database.js');
  const { runSeed, SEED_CREDENTIALS, SEED_PASSWORD } = await import('../src/seed/seed.js');
  const { default: app } = await import('../src/app.js');

  await connectDatabase();
  const stats = await runSeed();
  console.log('Seed complete (idempotent):', JSON.stringify(stats));

  server = app.listen(process.env.PORT || 5000, () => {
    console.log(`BugBoard API running on http://localhost:${process.env.PORT || 5000}`);
    console.log(`Demo accounts (password "${SEED_PASSWORD}"):`);
    for (const credential of SEED_CREDENTIALS) {
      console.log(`  ${credential.role.padEnd(9)} ${credential.email}`);
    }
    console.log('Open the client at http://localhost:5173 to sign in.');
  });
}

main().catch(async (error) => {
  console.error('Unable to start the in-memory API.', error);
  await stop();
  process.exit(1);
});

process.on('SIGINT', () => stop());
process.on('SIGTERM', () => stop());
