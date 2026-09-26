import { execFile } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { promisify } from 'node:util';
import dotenv from 'dotenv';
import type { TestProject } from 'vitest/node';
import { dropTestSchemas, workerDatabaseUrl } from './e2e-database';

const execFileAsync = promisify(execFile);

export default async function setup(project: TestProject) {
  const root = project.config.root;
  dotenv.config({
    path: [resolve(root, '.env.test'), resolve(root, '.env')],
    override: false,
    quiet: true,
  });
  const baseUrl = process.env.DATABASE_URL;
  if (!baseUrl)
    throw new Error('Provide DATABASE_URL for the E2E test database.');

  const runId = randomUUID().replaceAll('-', '');
  const workers = project.config.maxWorkers;
  const databaseUrls: Record<string, string> = {};
  const schemas: string[] = [];
  const prismaCli = createRequire(resolve(root, 'package.json')).resolve(
    'prisma/build/index.js',
  );
  const started = performance.now();

  try {
    // Prepare slots sequentially to avoid Prisma migration lock contention.
    for (let slot = 1; slot <= workers; slot++) {
      const schema = `e2e_${runId}_${slot}`;
      schemas.push(schema);
      const databaseUrl = workerDatabaseUrl(baseUrl, schema);
      await execFileAsync(process.execPath, [prismaCli, 'migrate', 'deploy'], {
        cwd: root,
        env: { ...process.env, DATABASE_URL: databaseUrl },
        timeout: 120_000,
      });
      databaseUrls[String(slot)] = databaseUrl;
    }
    project.provide('e2eDatabaseUrls', databaseUrls);
    console.info(
      `[E2E database] ${workers} migrated schemas ready in ${((performance.now() - started) / 1000).toFixed(2)}s`,
    );
  } catch (error) {
    await dropTestSchemas(baseUrl, schemas);
    throw error;
  }

  return async () => {
    await dropTestSchemas(baseUrl, schemas);
  };
}
