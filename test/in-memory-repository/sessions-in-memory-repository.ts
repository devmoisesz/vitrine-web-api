import type { AuthSession } from '@prisma/client';
import {
  SessionsRepository,
  type NewSession,
  type RotateSession,
} from '@/database/repositories/sessions-repository';
import { UsersInMemoryRepository } from './users-in-memory-repository';

export class SessionsInMemoryRepository implements SessionsRepository {
  items: AuthSession[] = [];
  constructor(readonly users: UsersInMemoryRepository) {}

  async create(data: NewSession) {
    this.items.push({ ...data, revokedAt: null, createdAt: new Date() });
  }

  async findById(id: string) {
    const session = this.items.find((item) => item.id === id);
    const user = this.users.items.find((item) => item.id === session?.userId);
    return session && user ? { ...session, user: { ...user } } : null;
  }

  async rotate(data: RotateSession) {
    const session = this.items.find((item) => item.id === data.id);
    const user = this.users.items.find((item) => item.id === data.userId);
    if (
      !session ||
      !user ||
      session.userId !== data.userId ||
      session.revokedAt ||
      session.sessionVersion !== data.sessionVersion ||
      user.sessionVersion !== data.sessionVersion ||
      session.refreshTokenHash !== data.previousHash ||
      session.expiresAt <= data.now
    )
      return false;
    session.refreshTokenHash = data.nextHash;
    session.expiresAt = data.expiresAt;
    return true;
  }

  async revoke(id: string, userId: string, now: Date) {
    const session = this.items.find(
      (item) => item.id === id && item.userId === userId,
    );
    if (session && !session.revokedAt) session.revokedAt = now;
  }
}
