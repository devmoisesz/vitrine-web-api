import type { AuthSession, User } from '@prisma/client';

export type SessionWithUser = AuthSession & { user: User };
export type NewSession = Omit<AuthSession, 'createdAt' | 'revokedAt'>;
export interface RotateSession {
  id: string;
  userId: string;
  sessionVersion: number;
  previousHash: string;
  nextHash: string;
  expiresAt: Date;
  now: Date;
}

export abstract class SessionsRepository {
  abstract create(data: NewSession): Promise<void>;
  abstract findById(id: string): Promise<SessionWithUser | null>;
  // Compare-and-swap must be atomic: at most one request can consume a token.
  abstract rotate(data: RotateSession): Promise<boolean>;
  abstract revoke(id: string, userId: string, now: Date): Promise<void>;
}
