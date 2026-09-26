import { Client } from 'pg';

const schemaPattern = /^e2e_[a-f0-9]{32}_[1-9]\d*$/;

export function assertTestSchema(schema: string): void {
  if (!schemaPattern.test(schema)) {
    throw new Error('Refusing to modify a schema outside the E2E run.');
  }
}

export function workerDatabaseUrl(baseUrl: string, schema: string): string {
  assertTestSchema(schema);
  const url = new URL(baseUrl);
  url.searchParams.set('schema', schema);
  url.searchParams.set('options', `-c search_path=${schema}`);
  return url.toString();
}

function quoteIdentifier(name: string): string {
  return `"${name.replaceAll('"', '""')}"`;
}

export async function resetTestDatabase(databaseUrl: string): Promise<void> {
  const schema = new URL(databaseUrl).searchParams.get('schema') ?? '';
  assertTestSchema(schema);
  const client = new Client({
    connectionString: databaseUrl,
    connectionTimeoutMillis: 5_000,
    statement_timeout: 15_000,
    lock_timeout: 10_000,
    application_name: `e2e_reset_${schema}`,
  });
  try {
    await client.connect();
    const { rows } = await client.query<{ tablename: string }>(
      'SELECT tablename FROM pg_tables WHERE schemaname = $1 AND tablename <> $2',
      [schema, '_prisma_migrations'],
    );
    if (rows.length === 0) throw new Error('E2E schema has not been migrated.');
    const tables = rows.map(
      ({ tablename }) =>
        `${quoteIdentifier(schema)}.${quoteIdentifier(tablename)}`,
    );
    // All tables (including join tables and sessions) are reset together.
    // No CASCADE: unexpected references from outside this schema must fail safely.
    await client.query(`TRUNCATE TABLE ${tables.join(', ')} RESTART IDENTITY`);
  } finally {
    await client.end();
  }
}

export async function dropTestSchemas(
  baseUrl: string,
  schemas: string[],
): Promise<void> {
  schemas.forEach(assertTestSchema);
  const client = new Client({ connectionString: baseUrl });
  try {
    await client.connect();
    for (const schema of schemas) {
      await client.query(
        `DROP SCHEMA IF EXISTS ${quoteIdentifier(schema)} CASCADE`,
      );
    }
  } finally {
    await client.end();
  }
}
