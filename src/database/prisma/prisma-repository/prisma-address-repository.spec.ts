import { Prisma } from '@prisma/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { PrismaService } from '../prisma.service';
import type { UserAddressUpdate } from '@/database/repositories/addresses-repository';
import { PrismaAddressRepository } from './prisma-address-repository';

describe('PrismaAddressRepository personal address ownership', () => {
  const prisma = { address: { findFirst: vi.fn(), update: vi.fn() } };
  const repository = new PrismaAddressRepository(
    prisma as unknown as PrismaService,
  );
  const data: UserAddressUpdate = {
    label: 'Casa',
    cep: '01001000',
    state: 'SP',
    city: 'São Paulo',
    neighborhood: 'Centro',
    street: 'Rua A',
    number: '10',
    complement: null,
  };

  beforeEach(() => vi.resetAllMocks());

  it('filters the lookup by address, authenticated user and absence of a store', async () => {
    prisma.address.findFirst.mockResolvedValue(null);
    await expect(
      repository.findByIdAndUserId('address-a', 'user-a'),
    ).resolves.toBeNull();
    expect(prisma.address.findFirst).toHaveBeenCalledExactlyOnceWith({
      where: { id: 'address-a', userId: 'user-a', storeId: null },
    });
  });

  it('enforces ownership in the update and never writes identity or ownership fields', async () => {
    const injected = {
      ...data,
      id: 'other-address',
      userId: 'other-user',
      storeId: 'store-a',
      createdAt: new Date(0),
    };
    const updated = {
      ...data,
      id: 'address-a',
      userId: 'user-a',
      storeId: null,
    };
    prisma.address.update.mockResolvedValue(updated);

    await expect(
      repository.saveForUser('address-a', 'user-a', injected),
    ).resolves.toEqual(updated);
    expect(prisma.address.update).toHaveBeenCalledExactlyOnceWith({
      where: { id: 'address-a', userId: 'user-a', AND: { storeId: null } },
      data,
    });
  });

  it.each([
    ['', 'user-a'],
    ['address-a', ''],
    [undefined, 'user-a'],
    ['address-a', undefined],
  ])(
    'does not read or write without both identifiers: %s, %s',
    async (id, userId) => {
      await expect(
        repository.findByIdAndUserId(id as string, userId as string),
      ).resolves.toBeNull();
      await expect(
        repository.saveForUser(id as string, userId as string, data),
      ).resolves.toBeNull();
      expect(prisma.address.findFirst).not.toHaveBeenCalled();
      expect(prisma.address.update).not.toHaveBeenCalled();
    },
  );

  it('returns null if the scoped update no longer matches a record', async () => {
    prisma.address.update.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('Record not found', {
        code: 'P2025',
        clientVersion: 'test',
      }),
    );
    await expect(
      repository.saveForUser('address-a', 'user-a', data),
    ).resolves.toBeNull();
  });

  it('propagates unexpected database failures', async () => {
    const error = new Error('Database unavailable');
    prisma.address.update.mockRejectedValue(error);
    await expect(
      repository.saveForUser('address-a', 'user-a', data),
    ).rejects.toBe(error);
  });
});
