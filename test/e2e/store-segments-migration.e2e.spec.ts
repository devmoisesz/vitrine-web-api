import { randomUUID } from 'node:crypto';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { Client } from 'pg';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { expect, test } from 'vitest';
import { assertTestSchema, dropTestSchemas, workerDatabaseUrl } from '../e2e-database';

test('incremental segment migration preserves two existing stores and all related records', async () => {
  const schema = `e2e_${randomUUID().replaceAll('-', '')}_1`;
  assertTestSchema(schema);
  const baseUrl = process.env.DATABASE_URL!;
  const databaseUrl = workerDatabaseUrl(baseUrl, schema);
  const sql = new Client({ connectionString: databaseUrl });
  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: databaseUrl }, { schema }) });
  await sql.connect();
  try {
    await sql.query(`CREATE SCHEMA "${schema}"`);
    const migrations = readdirSync('prisma/migrations').filter(name => /^\d/.test(name)).sort();
    const target = '20261009120000_add_store_segments';
    for (const migration of migrations.filter(name => name < target)) {
      await sql.query(readFileSync(join('prisma/migrations', migration, 'migration.sql'), 'utf8'));
    }
    const user = await prisma.user.create({ data: { name: 'Existing owner', email: 'existing@migration.test' } });
    const a = await prisma.store.create({ data: { name: 'Existing A', slug: 'existing-a', whatsapp: '11900000001' } });
    const b = await prisma.store.create({ data: { name: 'Existing B', slug: 'existing-b', whatsapp: '11900000002' } });
    await prisma.collaborator.create({ data: { userId: user.id, storeId: a.id, role: 'PROPRIETARIO' } });
    const category = await prisma.category.create({ data: { name: 'Category', slug: 'category' } });
    const subcategory = await prisma.subCategory.create({ data: { name: 'Subcategory', slug: 'subcategory', categoryId: category.id } });
    const product = await prisma.product.create({ data: { name: 'Existing product', slug: 'existing-product', description: 'Preserved', price: 20, stock: 3, sizes: ['M'], storeId: a.id, categoryId: category.id, subcategoryId: subcategory.id } });
    await prisma.productImages.create({ data: { productId: product.id, image_url: 'https://example.test/image.png', storage_public_id: 'preserved', is_main: true } });
    const cart = await prisma.cart.create({ data: { userId: user.id, storeId: a.id } });
    await prisma.cartItems.create({ data: { cartId: cart.id, productId: product.id, quantity: 1, selectedSize: 'M' } });
    const order = await prisma.order.create({ data: { userId: user.id, storeId: a.id, total: 20 } });
    await prisma.orderItems.create({ data: { orderId: order.id, productId: product.id, price: 20, quantity: 1 } });
    const tables = (await sql.query<{ tablename: string }>('SELECT tablename FROM pg_tables WHERE schemaname = $1 ORDER BY tablename', [schema])).rows;
    async function snapshot() {
      const result: Record<string, unknown[]> = {};
      for (const { tablename } of tables) {
        const quoted = '"' + tablename.replaceAll('"', '""') + '"';
        result[tablename] = (await sql.query(`SELECT row_to_json(t) AS row FROM ${quoted} t ORDER BY row_to_json(t)::text`)).rows;
      }
      return result;
    }
    const before = await snapshot();
    await sql.query(readFileSync(join('prisma/migrations', target, 'migration.sql'), 'utf8'));
    expect(await snapshot()).toEqual(before);
    expect(await prisma.store.findMany({ orderBy: { slug: 'asc' }, include: { storeSegments: true } })).toEqual([
      { ...a, storeSegments: [] }, { ...b, storeSegments: [] },
    ]);
    expect(await prisma.segment.count()).toBe(0);
    expect(await prisma.storeSegment.count()).toBe(0);
  } finally {
    await prisma.$disconnect();
    await sql.end();
    await dropTestSchemas(baseUrl, [schema]);
  }
});
