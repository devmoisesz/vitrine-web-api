import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { PrismaService } from '../prisma.service';
import { PrismaProductsRepository } from './prisma-product-repository';

describe('Public catalog store isolation', () => {
  const prisma = {
    product: { findMany: vi.fn(), count: vi.fn() },
    $transaction: vi.fn((queries: Promise<unknown>[]) => Promise.all(queries)),
  };
  const repository = new PrismaProductsRepository(
    prisma as unknown as PrismaService,
  );

  beforeEach(() => {
    vi.clearAllMocks();
    prisma.product.findMany.mockResolvedValue([]);
    prisma.product.count.mockResolvedValue(0);
  });

  it('scopes rows and count before applying page 2, search and category filters', async () => {
    await repository.findManyByStore(
      'store-a',
      2,
      'camisa',
      'category-a',
      'subcategory-a',
    );
    const { where, skip, take } = prisma.product.findMany.mock.calls[0][0];
    expect(where).toMatchObject({
      storeId: 'store-a',
      status: 'ATIVO',
      store: { status: 'ATIVA' },
      categoryId: 'category-a',
      subcategoryId: 'subcategory-a',
      OR: [
        { name: { contains: 'camisa', mode: 'insensitive' } },
        { description: { contains: 'camisa', mode: 'insensitive' } },
      ],
    });
    expect({ skip, take }).toEqual({ skip: 40, take: 40 });
    expect(prisma.product.count).toHaveBeenCalledWith({ where });
  });

  it('uses the requested store independently when navigating between stores', async () => {
    await repository.findManyByStore('store-a', 1);
    await repository.findManyByStore('store-b', 1);
    expect(
      prisma.product.findMany.mock.calls.map(([query]) => query.where.storeId),
    ).toEqual(['store-a', 'store-b']);
    expect(
      prisma.product.count.mock.calls.map(([query]) => query.where.storeId),
    ).toEqual(['store-a', 'store-b']);
  });
});
