import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { User } from '@prisma/client';
import { createHash, randomUUID } from 'node:crypto';
import { SessionsRepository } from '@/database/repositories/sessions-repository';
import { assertTokenPayload, type TokenPayload } from './token-payload';

@Injectable()
export class SessionService {
  constructor(
    private jwt: JwtService,
    private sessions: SessionsRepository,
  ) {}

  private hash(token: string) {
    return createHash('sha256').update(token).digest('hex');
  }

  private issue(user: User, sid: string) {
    const access_token = this.jwt.sign(
      { role: user.role, token_use: 'access', sid },
      { subject: user.id, expiresIn: '15m', jwtid: randomUUID() },
    );
    const refresh_token = this.jwt.sign(
      { role: user.role, token_use: 'refresh', sid },
      { subject: user.id, expiresIn: '1h', jwtid: randomUUID() },
    );
    return { access_token, refresh_token };
  }

  private expiresAt(token: string) {
    return new Date(this.jwt.decode<{ exp: number }>(token).exp * 1000);
  }

  async create(user: User) {
    const sid = randomUUID();
    const tokens = this.issue(user, sid);
    await this.sessions.create({
      id: sid,
      userId: user.id,
      sessionVersion: user.sessionVersion,
      refreshTokenHash: this.hash(tokens.refresh_token),
      expiresAt: this.expiresAt(tokens.refresh_token),
    });
    return tokens;
  }

  private async active(payload: TokenPayload) {
    const session = await this.sessions.findById(payload.sid);
    if (
      !session ||
      session.userId !== payload.sub ||
      session.revokedAt ||
      session.expiresAt.getTime() <= Date.now() ||
      session.sessionVersion !== session.user.sessionVersion
    ) {
      throw new UnauthorizedException('Invalid or expired session.');
    }
    return session;
  }

  async authenticate(payload: TokenPayload) {
    const session = await this.active(payload);
    return { sub: session.userId, role: session.user.role };
  }

  private async verifyRefresh(token: string, ignoreExpiration = false) {
    let payload: unknown;
    try {
      payload = await this.jwt.verifyAsync(token, {
        algorithms: ['RS256'],
        ignoreExpiration,
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
    assertTokenPayload(payload, 'refresh');
    return payload;
  }

  async refresh(token: string) {
    const payload = await this.verifyRefresh(token);
    const session = await this.active(payload);
    const tokens = this.issue(session.user, session.id);
    const consumed = await this.sessions.rotate({
      id: session.id,
      userId: session.userId,
      sessionVersion: session.sessionVersion,
      previousHash: this.hash(token),
      nextHash: this.hash(tokens.refresh_token),
      expiresAt: this.expiresAt(tokens.refresh_token),
      now: new Date(),
    });
    if (!consumed) {
      // Reuse (including competing refreshes) compromises this session family.
      await this.sessions.revoke(session.id, session.userId, new Date());
      throw new UnauthorizedException(
        'Refresh token already used or session revoked.',
      );
    }
    return tokens;
  }

  async logout(token?: string) {
    if (!token) return;
    let payload: TokenPayload;
    try {
      // A signed expired/consumed token may still terminate its own session.
      payload = await this.verifyRefresh(token, true);
    } catch (error) {
      if (error instanceof UnauthorizedException) return;
      throw error;
    }
    await this.sessions.revoke(payload.sid, payload.sub, new Date());
  }
}
