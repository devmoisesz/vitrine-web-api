import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { PrismaService } from '../prisma.service';
import { PrismaCollaboratorsRepository } from './prisma-collaborators-repository';

describe('PrismaCollaboratorsRepository store-scoped lookup', () => {
  const prisma = { collaborator: { findFirst: vi.fn() } };
  const repository = new PrismaCollaboratorsRepository(
    prisma as unknown as PrismaService,
  );

  beforeEach(() => vi.resetAllMocks());

  it('requires both collaborator id and store id in the database filter', async () => {
    prisma.collaborator.findFirst.mockResolvedValue({
      id: 'employee-a',
      storeId: 'store-a',
    });
    await expect(
      repository.findByIdAndStoreId('employee-a', 'store-a'),
    ).resolves.toEqual({ id: 'employee-a', storeId: 'store-a' });
    expect(prisma.collaborator.findFirst).toHaveBeenCalledExactlyOnceWith({
      where: { id: 'employee-a', storeId: 'store-a' },
    });
  });

  it.each([
    ['', 'store-a'],
    ['employee-a', ''],
    [undefined, 'store-a'],
    ['employee-a', undefined],
  ])('never queries without both identifiers: %s, %s', async (id, storeId) => {
    await expect(
      repository.findByIdAndStoreId(id as string, storeId as string),
    ).resolves.toBeNull();
    expect(prisma.collaborator.findFirst).not.toHaveBeenCalled();
  });
});
