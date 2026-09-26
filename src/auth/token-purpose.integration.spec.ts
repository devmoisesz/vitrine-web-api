import { Controller, Get, INestApplication, UseGuards } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { generateKeyPairSync } from 'node:crypto';
import { hash } from 'bcryptjs';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import { EnvService } from '@/env/env.service';
import { UsersRepository } from '@/database/repositories/users-repository';
import { AuthenticateController } from '@/http/controllers/users/authenticate.controller';
import { GoogleAuthenticateController } from '@/http/controllers/users/google-authenticate.controller';
import { RefreshTokenController } from '@/http/controllers/users/refresh-token.controller';
import { AuthenticateService } from '@/use-cases/services/users/authenticate.service';
import { GoogleAuthenticateService } from '@/use-cases/services/users/google-authenticate.service';
import { UsersInMemoryRepository } from '../../test/in-memory-repository/users-in-memory-repository';
import { JwtStrategy } from './jwt.strategy';
import { JwtAuthGuard } from './jwt-auth.guard';
import { CurrentUser } from './current-user-decorator';
import type { UserPayload } from './jwt-payload';
import { SessionService } from './session.service';
import { SessionsRepository } from '@/database/repositories/sessions-repository';
import { SessionsInMemoryRepository } from '../../test/in-memory-repository/sessions-in-memory-repository';
import { LogoutController } from '@/http/controllers/users/logout.controller';
import { ChangePasswordController } from '@/http/controllers/users/change-password.controller';
import { ChangePasswordService } from '@/use-cases/services/users/change-password.service';

const { verifyIdToken } = vi.hoisted(() => ({ verifyIdToken: vi.fn() }));
vi.mock('google-auth-library', () => ({
  OAuth2Client: class {
    verifyIdToken = verifyIdToken;
  },
}));

@Controller('token-test/protected')
@UseGuards(JwtAuthGuard)
class ProtectedController {
  @Get()
  handle(@CurrentUser() user: UserPayload) {
    return user;
  }
}

describe('SEG-06 token purpose (HTTP with real signing and authentication)', () => {
  let app: INestApplication;
  let jwt: JwtService;
  const users = new UsersInMemoryRepository();
  const sessions = new SessionsInMemoryRepository(users);
  let sessionService: SessionService;
  let currentTokens: { access_token: string; refresh_token: string };
  let passwordHash: string;

  beforeAll(async () => {
    const { privateKey, publicKey } = generateKeyPairSync('rsa', {
      modulusLength: 2048,
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
      publicKeyEncoding: { type: 'spki', format: 'pem' },
    });
    jwt = new JwtService({
      privateKey,
      publicKey,
      signOptions: { algorithm: 'RS256' },
    });
    passwordHash = await hash('strong-password', 4);
    const moduleRef = await Test.createTestingModule({
      imports: [PassportModule],
      controllers: [
        AuthenticateController,
        GoogleAuthenticateController,
        RefreshTokenController,
        ProtectedController,
        LogoutController,
        ChangePasswordController,
      ],
      providers: [
        AuthenticateService,
        GoogleAuthenticateService,
        JwtStrategy,
        SessionService,
        ChangePasswordService,
        { provide: SessionsRepository, useValue: sessions },
        { provide: JwtService, useValue: jwt },
        { provide: UsersRepository, useValue: users },
        {
          provide: EnvService,
          useValue: { get: () => Buffer.from(publicKey).toString('base64') },
        },
      ],
    }).compile();
    app = moduleRef.createNestApplication();
    sessionService = moduleRef.get(SessionService);
    app.use(cookieParser());
    await app.init();
  });

  beforeEach(async () => {
    vi.resetAllMocks();
    users.items = [];
    sessions.items = [];
    await users.create({
      id: 'local-user',
      name: 'Local User',
      email: 'local@example.com',
      password: passwordHash,
      provider: 'LOCAL',
    });
    currentTokens = await sessionService.create(users.items[0]);
    verifyIdToken.mockResolvedValue({
      getPayload: () => ({
        sub: 'google-user',
        email: 'google@example.com',
        name: 'Google User',
        email_verified: true,
      }),
    });
  });

  afterAll(async () => {
    await app?.close();
  });

  async function expectTokenPair(
    response: request.Response,
    subject: string,
    role = 'USER',
  ) {
    const access = await jwt.verifyAsync(response.body.access_token, {
      algorithms: ['RS256'],
    });
    const refresh = await jwt.verifyAsync(response.body.refresh_token, {
      algorithms: ['RS256'],
    });
    expect(access).toMatchObject({ sub: subject, role, token_use: 'access' });
    expect(refresh).toMatchObject({ sub: subject, role, token_use: 'refresh' });
    expect(access.exp - access.iat).toBe(15 * 60);
    expect(refresh.exp - refresh.iat).toBe(60 * 60);
    expect(response.body.access_token).not.toBe(response.body.refresh_token);
    expect(response.headers['set-cookie']).toEqual([
      expect.stringContaining(`refreshToken=${response.body.refresh_token};`),
    ]);
    expect(response.headers['set-cookie'][0]).toContain('HttpOnly');
  }

  it.each(['USER', 'ADMIN'] as const)(
    'issues purpose-specific tokens for password login with role %s',
    async (role) => {
      users.items[0].role = role;
      const response = await request(app.getHttpServer())
        .post('/authenticate')
        .send({ email: 'local@example.com', password: 'strong-password' })
        .expect(200);
      await expectTokenPair(response, 'local-user', role);
    },
  );

  it.each([false, true])(
    'issues purpose-specific tokens for Google login, existing user: %s',
    async (existing) => {
      if (existing) {
        await users.create({
          id: 'existing-google-user',
          name: 'Google User',
          email: 'google@example.com',
          provider: 'GOOGLE',
          password: null,
        });
      }
      const response = await request(app.getHttpServer())
        .post('/authenticate/google')
        .send({ id_token: 'mock-verified-google-token' })
        .expect(200);
      const user = await users.findByEmail('google@example.com');
      await expectTokenPair(response, user!.id);
      expect(verifyIdToken).toHaveBeenCalledWith(
        expect.objectContaining({ idToken: 'mock-verified-google-token' }),
      );
    },
  );

  it('preserves the token purposes when renewing a session', async () => {
    const token = currentTokens.refresh_token;
    const response = await request(app.getHttpServer())
      .patch('/refresh')
      .set('Cookie', `refreshToken=${token}`)
      .expect(200);
    await expectTokenPair(response, 'local-user');
  });

  it.each(['password', 'google'])(
    'allows access and renewal with the correct tokens from %s login',
    async (provider) => {
      const login = await request(app.getHttpServer())
        .post(
          provider === 'password' ? '/authenticate' : '/authenticate/google',
        )
        .send(
          provider === 'password'
            ? { email: 'local@example.com', password: 'strong-password' }
            : { id_token: 'mock-verified-google-token' },
        )
        .expect(200);
      const identity = jwt.verify(login.body.access_token);

      await request(app.getHttpServer())
        .get('/token-test/protected')
        .set('Authorization', `Bearer ${login.body.access_token}`)
        .expect(200, { sub: identity.sub, role: identity.role });

      await request(app.getHttpServer())
        .get('/token-test/protected')
        .set('Authorization', `Bearer ${login.body.refresh_token}`)
        .expect(401);

      const rejected = await request(app.getHttpServer())
        .patch('/refresh')
        .set('Cookie', `refreshToken=${login.body.access_token}`)
        .expect(401);
      expect(rejected.body).not.toHaveProperty('access_token');
      expect(rejected.body).not.toHaveProperty('refresh_token');
      expect(rejected.headers['set-cookie'][0]).toContain('refreshToken=;');

      const refreshed = await request(app.getHttpServer())
        .patch('/refresh')
        .set('Cookie', `refreshToken=${login.body.refresh_token}`)
        .expect(200);
      await expectTokenPair(refreshed, identity.sub, identity.role);
      await request(app.getHttpServer())
        .get('/token-test/protected')
        .set('Authorization', `Bearer ${refreshed.body.access_token}`)
        .expect(200, { sub: identity.sub, role: identity.role });
    },
  );

  describe.each(['access', 'refresh'] as const)('%s validation', (purpose) => {
    function perform(token: string) {
      return purpose === 'access'
        ? request(app.getHttpServer())
            .get('/token-test/protected')
            .set('Authorization', `Bearer ${token}`)
        : request(app.getHttpServer())
            .patch('/refresh')
            .set('Cookie', `refreshToken=${token}`);
    }

    const invalidClaims = [
      ['missing purpose', { token_use: undefined }],
      ['unknown purpose', { token_use: 'session' }],
      ['non-string purpose', { token_use: ['access', 'refresh'] }],
      ['missing subject', { sub: undefined }],
      ['empty subject', { sub: '' }],
      ['blank subject', { sub: '   ' }],
      ['non-string subject', { sub: 42 }],
      ['missing role', { role: undefined }],
      ['unknown role', { role: 'OWNER' }],
      ['missing session', { sid: undefined }],
      ['empty session', { sid: '' }],
      ['unknown session', { sid: 'nonexistent' }],
    ] as const;

    it.each(invalidClaims)(
      'rejects a signed token with %s',
      async (_, overrides) => {
        const token = jwt.sign(
          {
            sub: 'local-user',
            role: 'USER',
            token_use: purpose,
            sid: jwt.decode(currentTokens.access_token).sid,
            ...overrides,
          },
          { expiresIn: '1h' },
        );
        await perform(token).expect(401);
      },
    );

    it.each(['USER', 'ADMIN'] as const)(
      'accepts a valid token for role %s',
      async (role) => {
        users.items[0].role = role;
        const tokens = await sessionService.create(users.items[0]);
        const token =
          purpose === 'access' ? tokens.access_token : tokens.refresh_token;
        const response = await perform(token).expect(200);
        if (purpose === 'refresh') {
          await expectTokenPair(response, 'local-user', role);
        } else {
          expect(response.body).toEqual({ sub: 'local-user', role });
        }
      },
    );

    it('rejects expired tokens', async () => {
      const token = jwt.sign(
        {
          sub: 'local-user',
          role: 'USER',
          token_use: purpose,
          sid: jwt.decode(currentTokens.access_token).sid,
        },
        { expiresIn: -1 },
      );
      await perform(token).expect(401);
    });

    it('rejects signatures from another key', async () => {
      const { privateKey } = generateKeyPairSync('rsa', {
        modulusLength: 2048,
        privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
        publicKeyEncoding: { type: 'spki', format: 'pem' },
      });
      const token = jwt.sign(
        {
          sub: 'local-user',
          role: 'USER',
          token_use: purpose,
          sid: jwt.decode(currentTokens.access_token).sid,
        },
        { privateKey, expiresIn: '1h' },
      );
      await perform(token).expect(401);
    });

    it('rejects a valid signature using a different algorithm', async () => {
      const token = jwt.sign(
        {
          sub: 'local-user',
          role: 'USER',
          token_use: purpose,
          sid: jwt.decode(currentTokens.access_token).sid,
        },
        { algorithm: 'RS384', expiresIn: '1h' },
      );
      await perform(token).expect(401);
    });

    it('rejects malformed tokens', async () => {
      await perform('not-a-jwt').expect(401);
    });
  });

  it('requires the refresh cookie even if the token is sent in the body or header', async () => {
    const token = jwt.sign(
      { sub: 'local-user', role: 'USER', token_use: 'refresh' },
      { expiresIn: '1h' },
    );
    await request(app.getHttpServer())
      .patch('/refresh')
      .set('Authorization', `Bearer ${token}`)
      .send({ refresh_token: token })
      .expect(401);
  });

  describe('SEG-07 persistent session lifecycle', () => {
    const access = (token: string) =>
      request(app.getHttpServer())
        .get('/token-test/protected')
        .set('Authorization', `Bearer ${token}`);
    const refresh = (token: string) =>
      request(app.getHttpServer())
        .patch('/refresh')
        .set('Cookie', `refreshToken=${token}`);
    const logout = (token: string) =>
      request(app.getHttpServer())
        .post('/logout')
        .set('Cookie', `refreshToken=${token}`);

    it.each(['logout', 'password'])('cannot rotate a session invalidated concurrently by %s', async (operation) => {
      const rotate = sessions.rotate.bind(sessions);
      const spy = vi.spyOn(sessions, 'rotate').mockImplementationOnce(async (data) => {
        if (operation === 'logout') await sessionService.logout(currentTokens.refresh_token);
        else await users.changePassword('local-user', 'new-hash');
        return rotate(data);
      });
      try {
        await refresh(currentTokens.refresh_token).expect(401);
        await access(currentTokens.access_token).expect(401);
      } finally {
        spy.mockRestore();
      }
    });

    it('does not acknowledge logout if persisting revocation fails', async () => {
      const spy = vi.spyOn(sessions, 'revoke').mockRejectedValueOnce(new Error('database unavailable'));
      try {
        await expect(sessionService.logout(currentTokens.refresh_token)).rejects.toThrow('database unavailable');
        await access(currentTokens.access_token).expect(200);
      } finally {
        spy.mockRestore();
      }
    });

    it('stores only a digest of the refresh token and rotates even within the same second', async () => {
      const initial = sessions.items[0];
      expect(initial.refreshTokenHash).toMatch(/^[a-f0-9]{64}$/);
      expect(JSON.stringify(initial)).not.toContain(
        currentTokens.refresh_token,
      );
      const oldHash = initial.refreshTokenHash;
      const first = await refresh(currentTokens.refresh_token).expect(200);
      const second = await refresh(first.body.refresh_token).expect(200);
      expect(
        new Set([
          currentTokens.refresh_token,
          first.body.refresh_token,
          second.body.refresh_token,
        ]).size,
      ).toBe(3);
      expect(initial.refreshTokenHash).not.toBe(oldHash);
      expect(sessions.items).toHaveLength(1);
      expect(jwt.decode(second.body.refresh_token).sid).toBe(initial.id);
      await access(second.body.access_token).expect(200);
    });

    it('revokes the entire affected session on reuse, keeping other sessions active', async () => {
      const other = await sessionService.create(users.items[0]);
      const rotated = await refresh(currentTokens.refresh_token).expect(200);
      await refresh(currentTokens.refresh_token).expect(401);
      await refresh(rotated.body.refresh_token).expect(401);
      await access(currentTokens.access_token).expect(401);
      await access(rotated.body.access_token).expect(401);
      await access(other.access_token).expect(200);
      await refresh(other.refresh_token).expect(200);
    });

    it('allows at most one concurrent refresh and revokes on the competing reuse', async () => {
      const responses = await Promise.all([
        refresh(currentTokens.refresh_token),
        refresh(currentTokens.refresh_token),
      ]);
      expect(responses.map((response) => response.status).sort()).toEqual([
        200, 401,
      ]);
      const success = responses.find((response) => response.status === 200)!;
      await refresh(success.body.refresh_token).expect(401);
      await access(success.body.access_token).expect(401);
    });

    it('logout revokes access and refresh immediately and is idempotent', async () => {
      const other = await sessionService.create(users.items[0]);
      const response = await logout(currentTokens.refresh_token).expect(200);
      expect(response.headers['set-cookie'][0]).toContain('refreshToken=;');
      await access(currentTokens.access_token).expect(401);
      await refresh(currentTokens.refresh_token).expect(401);
      await logout(currentTokens.refresh_token).expect(200);
      await access(other.access_token).expect(200);
    });

    it('logout can revoke the session using its consumed refresh token', async () => {
      const rotated = await refresh(currentTokens.refresh_token).expect(200);
      await logout(currentTokens.refresh_token).expect(200);
      await refresh(rotated.body.refresh_token).expect(401);
    });

    it('does not revoke sessions for malformed or access tokens sent to logout', async () => {
      await logout('invalid').expect(200);
      await logout(currentTokens.access_token).expect(200);
      await request(app.getHttpServer()).post('/logout').expect(200);
      await access(currentTokens.access_token).expect(200);
    });

    it('changing the password invalidates every session only for that account', async () => {
      const otherDevice = await sessionService.create(users.items[0]);
      const otherUser = await users.create({
        id: 'other-user',
        name: 'Other',
        email: 'other@example.com',
      });
      const otherAccount = await sessionService.create(otherUser);
      await request(app.getHttpServer())
        .patch('/account/password')
        .set('Authorization', `Bearer ${currentTokens.access_token}`)
        .send({
          currentPassword: 'strong-password',
          newPassword: 'new-strong-password',
        })
        .expect(204);
      for (const tokens of [currentTokens, otherDevice]) {
        await access(tokens.access_token).expect(401);
        await refresh(tokens.refresh_token).expect(401);
      }
      await access(otherAccount.access_token).expect(200);
      await request(app.getHttpServer())
        .post('/authenticate')
        .send({ email: 'local@example.com', password: 'strong-password' })
        .expect(400);
      const login = await request(app.getHttpServer())
        .post('/authenticate')
        .send({ email: 'local@example.com', password: 'new-strong-password' })
        .expect(200);
      await access(login.body.access_token).expect(200);
    });

    it('a rejected password change keeps the session valid', async () => {
      await request(app.getHttpServer())
        .patch('/account/password')
        .set('Authorization', `Bearer ${currentTokens.access_token}`)
        .send({
          currentPassword: 'wrong-password',
          newPassword: 'new-strong-password',
        })
        .expect(401);
      await access(currentTokens.access_token).expect(200);
      await refresh(currentTokens.refresh_token).expect(200);
    });

    it('uses current permissions for existing access tokens and refreshed tokens', async () => {
      users.items[0].role = 'ADMIN';
      const admin = await sessionService.create(users.items[0]);
      users.items[0].role = 'USER';
      await access(admin.access_token).expect(200, {
        sub: 'local-user',
        role: 'USER',
      });
      const rotated = await refresh(admin.refresh_token).expect(200);
      await expectTokenPair(rotated, 'local-user', 'USER');
    });

    it('rejects sessions whose user was deleted', async () => {
      users.items = [];
      await access(currentTokens.access_token).expect(401);
      await refresh(currentTokens.refresh_token).expect(401);
    });

    it('rejects expired sessions even while their JWT is still valid', async () => {
      sessions.items[0].expiresAt = new Date(Date.now() - 1);
      await access(currentTokens.access_token).expect(401);
      await refresh(currentTokens.refresh_token).expect(401);
    });

    it('rejects a signed token pointing at another user session', async () => {
      const token = jwt.sign({
        sub: 'other-user',
        role: 'USER',
        token_use: 'access',
        sid: sessions.items[0].id,
      });
      await access(token).expect(401);
      await access(currentTokens.access_token).expect(200);
    });

    it('keeps invalidated sessions invalid if login races with password change', async () => {
      const previouslyAuthenticated = { ...users.items[0] };
      await users.changePassword('local-user', 'new-hash');
      const lateLogin = await sessionService.create(previouslyAuthenticated);
      await access(lateLogin.access_token).expect(401);
      await refresh(lateLogin.refresh_token).expect(401);
    });
  });
});
