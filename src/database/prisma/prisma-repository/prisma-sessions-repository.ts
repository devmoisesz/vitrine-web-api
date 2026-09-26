import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import {
  SessionsRepository,
  type NewSession,
  type RotateSession,
} from '@/database/repositories/sessions-repository';

@Injectable()
export class PrismaSessionsRepository implements SessionsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: NewSession) {
    await this.prisma.authSession.create({ data });
  }

  findById(id: string) {
    return this.prisma.authSession.findUnique({
      where: { id },
      include: { user: true },
    });
  }

  async rotate(data: RotateSession) {
    const result = await this.prisma.authSession.updateMany({
      where: {
        id: data.id,
        userId: data.userId,
        sessionVersion: data.sessionVersion,
        user: { sessionVersion: data.sessionVersion },
        refreshTokenHash: data.previousHash,
        revokedAt: null,
        expiresAt: { gt: data.now },
      },
      data: { refreshTokenHash: data.nextHash, expiresAt: data.expiresAt },
    });
    return result.count === 1;
  }

  async revoke(id: string, userId: string, now: Date) {
    await this.prisma.authSession.updateMany({
      where: { id, userId, revokedAt: null },
      data: { revokedAt: now },
    });
  }
}
