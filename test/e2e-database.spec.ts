import { describe, expect, it } from 'vitest';
import {
  assertTestSchema,
  dropTestSchemas,
  resetTestDatabase,
  workerDatabaseUrl,
} from './e2e-database';

describe('E2E database isolation safeguards', () => {
  const schema = `e2e_${'a'.repeat(32)}_2`;

  it('sets both Prisma schema and PostgreSQL search_path without changing the source URL', () => {
    const original =
      'postgresql://localhost/test?schema=public&sslmode=disable';
    const result = new URL(workerDatabaseUrl(original, schema));
    expect(result.searchParams.get('schema')).toBe(schema);
    expect(result.searchParams.get('options')).toBe(`-c search_path=${schema}`);
    expect(result.searchParams.get('sslmode')).toBe('disable');
    expect(new URL(original).searchParams.get('schema')).toBe('public');
  });

  it.each([
    'public',
    '',
    'users',
    'e2e_fake_1',
    `e2e_${'a'.repeat(32)}_0`,
    `${schema}"; DROP SCHEMA public;--`,
  ])(
    'refuses unsafe schema %j before opening a database connection',
    async (invalid) => {
      expect(() => assertTestSchema(invalid)).toThrow('Refusing');
      expect(() =>
        workerDatabaseUrl('postgresql://localhost/test', invalid),
      ).toThrow('Refusing');
      await expect(
        dropTestSchemas('postgresql://localhost/test', [invalid]),
      ).rejects.toThrow('Refusing');
      const url = new URL('postgresql://localhost/test');
      url.searchParams.set('schema', invalid);
      await expect(resetTestDatabase(url.toString())).rejects.toThrow(
        'Refusing',
      );
    },
  );
});
