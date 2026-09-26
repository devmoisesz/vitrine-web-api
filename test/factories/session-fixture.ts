import { JwtService, type JwtSignOptions } from '@nestjs/jwt';
import { randomUUID } from 'node:crypto';
import { SessionService } from '@/auth/session.service';
import { SessionsRepository } from '@/database/repositories/sessions-repository';
import { UsersInMemoryRepository } from '../in-memory-repository/users-in-memory-repository';
import { SessionsInMemoryRepository } from '../in-memory-repository/sessions-in-memory-repository';

// Existing authorization suites keep real JWT and session validation while
// creating isolated session fixtures for each signed request.
export class SessionFixture {
  private users = new UsersInMemoryRepository();
  private sessions = new SessionsInMemoryRepository(this.users);

  providers(jwt: JwtService) {
    return [
      SessionService,
      { provide: JwtService, useValue: jwt },
      { provide: SessionsRepository, useValue: this.sessions },
    ];
  }

  sign(
    jwt: JwtService,
    payload: Record<string, unknown>,
    options?: JwtSignOptions,
  ) {
    const sid = randomUUID();
    const subject = options?.subject ?? payload.sub;
    if (typeof subject === 'string') {
      this.users.items = this.users.items.filter((user) => user.id !== subject);
      // create() mutates the in-memory fixture synchronously.
      void this.users.create({
        id: subject,
        name: 'Fixture',
        email: `${sid}@test.local`,
        role: payload.role === 'ADMIN' ? 'ADMIN' : 'USER',
      });
      void this.sessions.create({
        id: sid,
        userId: subject,
        sessionVersion: 0,
        refreshTokenHash: 'unused-access-only-fixture',
        expiresAt: new Date(Date.now() + 3600000),
      });
    }
    return jwt.sign({ ...payload, sid }, options);
  }
}
