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
      ],
      providers: [
        AuthenticateService,
        GoogleAuthenticateService,
        JwtStrategy,
        { provide: JwtService, useValue: jwt },
        { provide: UsersRepository, useValue: users },
        {
          provide: EnvService,
          useValue: { get: () => Buffer.from(publicKey).toString('base64') },
        },
      ],
    }).compile();
    app = moduleRef.createNestApplication();
    app.use(cookieParser());
    await app.init();
  });

  beforeEach(async () => {
    vi.resetAllMocks();
    users.items = [];
    await users.create({
      id: 'local-user',
      name: 'Local User',
      email: 'local@example.com',
      password: passwordHash,
      provider: 'LOCAL',
    });
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
    const token = jwt.sign(
      { role: 'USER', token_use: 'refresh' },
      { subject: 'local-user', expiresIn: '1h' },
    );
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
    ] as const;

    it.each(invalidClaims)(
      'rejects a signed token with %s',
      async (_, overrides) => {
        const token = jwt.sign(
          {
            sub: 'local-user',
            role: 'USER',
            token_use: purpose,
            ...overrides,
          },
          { expiresIn: '1h' },
        );
        await perform(token).expect(401);
      },
    );

    it.each(['USER', 'ADMIN'])(
      'accepts a valid token for role %s',
      async (role) => {
        const token = jwt.sign(
          { sub: 'local-user', role, token_use: purpose },
          { expiresIn: '1h' },
        );
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
        { sub: 'local-user', role: 'USER', token_use: purpose },
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
        { sub: 'local-user', role: 'USER', token_use: purpose },
        { privateKey, expiresIn: '1h' },
      );
      await perform(token).expect(401);
    });

    it('rejects a valid signature using a different algorithm', async () => {
      const token = jwt.sign(
        { sub: 'local-user', role: 'USER', token_use: purpose },
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
});
