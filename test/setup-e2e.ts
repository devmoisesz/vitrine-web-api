import { beforeAll, inject } from 'vitest';
import dotenv from 'dotenv';
import { resetTestDatabase } from './e2e-database';

dotenv.config({
  path: ['.env.test', '.env'],
  override: false,
  quiet: true,
});

const slot = process.env.VITEST_POOL_ID ?? '';
const databaseUrl = inject('e2eDatabaseUrls')[slot];
if (!databaseUrl)
  throw new Error(`No isolated E2E database assigned to worker ${slot}.`);

// Set before test modules import AppModule or construct Prisma clients.
process.env.DATABASE_URL = databaseUrl;

beforeAll(async () => {
  const started = performance.now();
  await resetTestDatabase(databaseUrl);
  if (process.env.E2E_PROFILE === '1') {
    console.info(
      `[E2E database] worker ${slot} reset in ${(performance.now() - started).toFixed(0)}ms`,
    );
  }
});
