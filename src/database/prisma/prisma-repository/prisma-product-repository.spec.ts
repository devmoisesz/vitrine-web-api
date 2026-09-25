import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { PrismaService } from '../prisma.service';
import { PrismaProductsRepository } from './prisma-product-repository';

describe('PrismaProductsRepository store-scoped lookup', () => {
  const prisma = { product: { findFirst: vi.fn() } };
  const repository = new PrismaProductsRepository(
    prisma as unknown as PrismaService,
  );

  beforeEach(() => vi.resetAllMocks());

  it('includes both product id and store slug in the database filter', async () => {
    prisma.product.findFirst.mockResolvedValue({
      id: 'product-a',
      storeId: 'store-a',
    });
    await expect(
      repository.findByIdAndStoreSlug('product-a', 'loja-a'),
    ).resolves.toEqual({ id: 'product-a', storeId: 'store-a' });
    expect(prisma.product.findFirst).toHaveBeenCalledExactlyOnceWith({
      where: { id: 'product-a', store: { slug: 'loja-a' } },
    });
  });

  it.each([
    ['', 'loja-a'],
    ['product-a', ''],
    [undefined, 'loja-a'],
    ['product-a', undefined],
  ])('never queries without both identifiers: %s, %s', async (id, slug) => {
    await expect(
      repository.findByIdAndStoreSlug(id as string, slug as string),
    ).resolves.toBeNull();
    expect(prisma.product.findFirst).not.toHaveBeenCalled();
  });
});
