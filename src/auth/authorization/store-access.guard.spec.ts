import {
  BadRequestException,
  ExecutionContext,
  ForbiddenException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { StoreAccessGuard } from './store-access.guard';
import type { PrismaService } from '@/database/prisma/prisma.service';
import type { UserPayload } from '../jwt-payload';

describe('StoreAccessGuard', () => {
  let guard: StoreAccessGuard;
  const user: UserPayload = { sub: 'user-id', role: 'USER' };
  const prismaMock = {
    store: { findUnique: vi.fn() },
    collaborator: { findFirst: vi.fn() },
  };
  const reflectorMock = { getAllAndOverride: vi.fn() };

  beforeEach(() => {
    vi.resetAllMocks();
    guard = new StoreAccessGuard(
      prismaMock as unknown as PrismaService,
      reflectorMock as unknown as Reflector,
    );
    prismaMock.store.findUnique.mockResolvedValue({ id: 'store-id' });
  });

  function createMockContext(
    user: unknown,
    params: { storeId?: string; slug?: string } = { storeId: 'store-id' },
  ) {
    return {
      switchToHttp: () => ({ getRequest: () => ({ user, params }) }),
      getHandler: () => ({}),
      getClass: () => ({}),
    } as unknown as ExecutionContext;
  }

  it('allows a global admin without querying collaborators', async () => {
    const context = createMockContext({ sub: 'admin-id', role: 'ADMIN' });
    expect(await guard.canActivate(context)).toBe(true);
    expect(prismaMock.collaborator.findFirst).not.toHaveBeenCalled();
  });

  it.each([
    undefined,
    null,
    { id: 'legacy-id', role: 'USER' },
    { sub: undefined, role: 'USER' },
    { sub: null, role: 'USER' },
    { sub: '', role: 'USER' },
    { sub: '   ', role: 'USER' },
    { sub: 123, role: 'USER' },
    { role: 'ADMIN' },
    { sub: '', role: 'ADMIN' },
  ])(
    'rejects invalid identity %j before any database lookup',
    async (identity) => {
      await expect(
        guard.canActivate(createMockContext(identity)),
      ).rejects.toThrow(UnauthorizedException);
      expect(prismaMock.store.findUnique).not.toHaveBeenCalled();
      expect(prismaMock.collaborator.findFirst).not.toHaveBeenCalled();
    },
  );

  it('requires a store identifier', async () => {
    await expect(
      guard.canActivate(createMockContext(user, {})),
    ).rejects.toThrow(BadRequestException);
    expect(prismaMock.store.findUnique).not.toHaveBeenCalled();
  });

  it('rejects a missing store', async () => {
    prismaMock.store.findUnique.mockResolvedValue(null);
    await expect(guard.canActivate(createMockContext(user))).rejects.toThrow(
      NotFoundException,
    );
    expect(prismaMock.collaborator.findFirst).not.toHaveBeenCalled();
  });

  it.each([{ storeId: 'store-id' }, { slug: 'store-slug' }])(
    'scopes membership by the authenticated subject and resolved store: %j',
    async (params) => {
      prismaMock.collaborator.findFirst.mockResolvedValue(null);
      // An unrelated id must never override the authenticated subject.
      const context = createMockContext({ ...user, id: 'other-user' }, params);
      await expect(guard.canActivate(context)).rejects.toThrow(
        ForbiddenException,
      );
      expect(prismaMock.store.findUnique).toHaveBeenCalledWith({
        where:
          'storeId' in params ? { id: params.storeId } : { slug: params.slug },
      });
      expect(prismaMock.collaborator.findFirst).toHaveBeenCalledExactlyOnceWith(
        {
          where: { userId: user.sub, storeId: 'store-id' },
        },
      );
    },
  );

  it.each([undefined, []])(
    'allows a member without required roles: %j',
    async (roles) => {
      prismaMock.collaborator.findFirst.mockResolvedValue({
        role: 'FUNCIONARIO',
      });
      reflectorMock.getAllAndOverride.mockReturnValue(roles);
      expect(await guard.canActivate(createMockContext(user))).toBe(true);
    },
  );

  it('rejects an employee on an owner-only route', async () => {
    prismaMock.collaborator.findFirst.mockResolvedValue({
      role: 'FUNCIONARIO',
    });
    reflectorMock.getAllAndOverride.mockReturnValue(['PROPRIETARIO']);
    await expect(guard.canActivate(createMockContext(user))).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('allows an owner on an owner-only route', async () => {
    prismaMock.collaborator.findFirst.mockResolvedValue({
      role: 'PROPRIETARIO',
    });
    reflectorMock.getAllAndOverride.mockReturnValue(['PROPRIETARIO']);
    expect(await guard.canActivate(createMockContext(user))).toBe(true);
  });
});
