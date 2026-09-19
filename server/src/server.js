import app from './app.js';
import { connectDatabase } from './config/database.js';
import env from './config/env.js';

async function startServer() {
  await connectDatabase();
  app.listen(env.port, () => console.log(`BugBoard API listening on port ${env.port}`));
}

startServer().catch((error) => {
  console.error('Unable to start BugBoard API.', error.message);
  process.exit(1);
});
