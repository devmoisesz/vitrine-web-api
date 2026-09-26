import { Client } from 'pg';
import { expect, test } from 'vitest';

export function verifyDatabaseIsolation() {
  test('starts with empty data and the migrated constraints in its assigned schema', async () => {
    const client = new Client({ connectionString: process.env.DATABASE_URL });
    try {
      await client.connect();
      const { rows: schemaRows } = await client.query(
        'SELECT current_schema() AS name',
      );
      expect(schemaRows[0].name).toBe(
        new URL(process.env.DATABASE_URL!).searchParams.get('schema'),
      );
      const { rows } = await client.query(
        'SELECT COUNT(*)::int AS count FROM users',
      );
      expect(rows[0].count).toBe(0);
      const migrations = await client.query(
        'SELECT COUNT(*)::int AS count FROM _prisma_migrations',
      );
      expect(migrations.rows[0].count).toBeGreaterThan(0);
      // Both files intentionally use the same keys. They must pass with 1 or 2 workers.
      await client.query(
        'INSERT INTO users (id, name, email) VALUES ($1, $2, $3)',
        ['isolation-sentinel', 'Isolation', 'isolation@example.test'],
      );
      await client.query(
        `INSERT INTO auth_sessions
        (id, user_id, session_version, refresh_token_hash, expires_at)
        VALUES ($1, $2, 0, $3, NOW() + INTERVAL '1 hour')`,
        ['isolation-session', 'isolation-sentinel', 'test-hash'],
      );
      await expect(
        client.query(
          'INSERT INTO users (id, name, email) VALUES ($1, $2, $3)',
          ['another-user', 'Isolation', 'isolation@example.test'],
        ),
      ).rejects.toMatchObject({ code: '23505' });
    } finally {
      await client.end();
    }
  });
}
