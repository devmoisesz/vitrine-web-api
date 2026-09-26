import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { PrismaService } from '../prisma.service';
import { PrismaSessionsRepository } from './prisma-sessions-repository';
import { PrismaUsersRepository } from './prisma-users-repository';

describe('SEG-07 atomic persistence safeguards', () => {
  const prisma = {
    authSession: { updateMany: vi.fn(), findUnique: vi.fn() },
    user: { update: vi.fn() },
  };
  const sessions = new PrismaSessionsRepository(
    prisma as unknown as PrismaService,
  );
  const users = new PrismaUsersRepository(prisma as unknown as PrismaService);
  beforeEach(() => vi.resetAllMocks());

  it.each([0, 1])(
    'only succeeds when the compare-and-swap updates one row (count=%s)',
    async (count) => {
      prisma.authSession.updateMany.mockResolvedValue({ count });
      const data = {
        id: 'session',
        userId: 'user',
        sessionVersion: 4,
        previousHash: 'old-hash',
        nextHash: 'new-hash',
        now: new Date(),
        expiresAt: new Date(Date.now() + 3600000),
      };
      await expect(sessions.rotate(data)).resolves.toBe(count === 1);
      expect(prisma.authSession.updateMany).toHaveBeenCalledExactlyOnceWith({
        where: {
          id: 'session',
          userId: 'user',
          sessionVersion: 4,
          user: { sessionVersion: 4 },
          refreshTokenHash: 'old-hash',
          revokedAt: null,
          expiresAt: { gt: data.now },
        },
        data: { refreshTokenHash: 'new-hash', expiresAt: data.expiresAt },
      });
    },
  );

  it('revokes only the requested user session and preserves its first revocation date', async () => {
    const now = new Date();
    await sessions.revoke('session', 'user', now);
    expect(prisma.authSession.updateMany).toHaveBeenCalledExactlyOnceWith({
      where: { id: 'session', userId: 'user', revokedAt: null },
      data: { revokedAt: now },
    });
  });

  it('updates the password and invalidates all sessions in one atomic user write', async () => {
    await users.changePassword('user', 'new-password-hash');
    expect(prisma.user.update).toHaveBeenCalledExactlyOnceWith({
      where: { id: 'user' },
      data: { password: 'new-password-hash', sessionVersion: { increment: 1 } },
    });
  });

  it('loads the current user alongside the persisted session', async () => {
    await sessions.findById('session');
    expect(prisma.authSession.findUnique).toHaveBeenCalledExactlyOnceWith({
      where: { id: 'session' },
      include: { user: true },
    });
  });
});
