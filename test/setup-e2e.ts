import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { execSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { afterAll, beforeAll } from 'vitest';
import dotenv from 'dotenv';

dotenv.config({
  path: ['.env.test', '.env'],
  override: false,
});

function generateUniqueDatabaseURL(schemaId: string) {
  if (!process.env.DATABASE_URL) {
    throw new Error('Please provide a DATABASE_URL environment variable.');
  }

  const url = new URL(process.env.DATABASE_URL);
  const schemaName = `test_${schemaId.replace(/-/g, '_')}`;

  // Para o Prisma CLI saber onde criar as tabelas
  url.searchParams.set('schema', schemaName);

  // Força o driver do Node.js usar o schema correto
  url.searchParams.set('options', `-c search_path=${schemaName}`);

  return url.toString();
}

const schemaId = randomUUID();
const databaseUrl = generateUniqueDatabaseURL(schemaId);

// Injeta a nova URL modificada nas variáveis de ambiente PRIMEIRO
process.env.DATABASE_URL = databaseUrl;

const schemaName = `test_${schemaId.replace(/-/g, '_')}`;

const adapter = new PrismaPg(
  { connectionString: process.env.DATABASE_URL },
  { schema: schemaName },
);

const prisma = new PrismaClient({
  adapter,
});

beforeAll(async () => {
  execSync('npx prisma migrate deploy');
});

afterAll(async () => {
  const schemaName = `test_${schemaId.replace(/-/g, '_')}`;

  await prisma.$executeRawUnsafe(
    `DROP SCHEMA IF EXISTS "${schemaName}" CASCADE`,
  );
  await prisma.$disconnect();
});
