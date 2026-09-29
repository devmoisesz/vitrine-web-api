import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { PrismaService } from '../prisma.service';
import { PrismaStoresRepository } from './prisma-stores-repository';

describe('PrismaStoresRepository home products', () => {
  const prisma = {
    $queryRaw: vi.fn(),
    store: { findMany: vi.fn(), count: vi.fn() },
  };
  const repository = new PrismaStoresRepository(
    prisma as unknown as PrismaService,
  );

  beforeEach(() => {
    vi.resetAllMocks();
    prisma.$queryRaw.mockResolvedValue([{ id: 'store-a' }]);
    prisma.store.findMany.mockResolvedValue([]);
    prisma.store.count.mockResolvedValue(1);
  });

  it.each([undefined, 'Loja'])(
    'filters active products in the database before taking the latest eight (name: %s)',
    async (name) => {
      await repository.findManyWithProducts(1, name);

      expect(prisma.store.findMany).toHaveBeenCalledExactlyOnceWith(
        expect.objectContaining({
          include: expect.objectContaining({
            products: expect.objectContaining({
              where: { status: 'ATIVO' },
              take: 8,
              orderBy: { createdAt: 'desc' },
            }),
          }),
        }),
      );
    },
  );
});
