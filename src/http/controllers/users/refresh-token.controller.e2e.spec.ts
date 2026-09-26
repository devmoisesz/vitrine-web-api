import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { PrismaService } from '../../../database/prisma/prisma.service';
import { AppModule } from '../../../app.module';
import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';
import { makeEmail } from '../../../../test/factories/make-email';
import cookieParser from 'cookie-parser';
import { SessionService } from '@/auth/session.service';

describe('Refresh token (E2E)', () => {
  let app: INestApplication;
  let prisma: PrismaClient;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useFactory({
        factory: () => {
          const databaseUrl = process.env.DATABASE_URL!;
          const schema =
            new URL(databaseUrl).searchParams.get('schema') ?? 'public';

          const adapter = new PrismaPg(
            { connectionString: databaseUrl },
            { schema },
          );

          return new PrismaClient({
            adapter,
            log: ['warn', 'error'],
          });
        },
      })
      .compile();

    app = moduleRef.createNestApplication();

    app.use(cookieParser())

    prisma = app.get(PrismaService);

    await app.init();
    await prisma.$connect();
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  test('[POST] /refresh', async () => {
    const uniqueEmail = makeEmail();

    await prisma.user.create({
      data: {
        name: 'john doe',
        email: uniqueEmail,
        password: await hash('123456', 8),
      },
    });

    const authResponse = await request(app.getHttpServer())
      .post('/authenticate')
      .send({
        email: uniqueEmail,
        password: '123456',
      });

    const cookies = authResponse.get('Set-Cookie');
    
    const response = await request(app.getHttpServer())
      .patch('/refresh')
      .set('Cookie', cookies)
      .send();

    expect(response.statusCode).toEqual(200);
    expect(response.body).toEqual({
        access_token: expect.any(String),
        refresh_token: expect.any(String)
    });
    expect(response.get('Set-Cookie')).toEqual([
      expect.stringContaining('refreshToken'),
    ]);
  });

  async function createSession() {
    const user = await prisma.user.create({ data: {
      name: 'Session User', email: makeEmail(), password: await hash('strong-password', 4),
    } });
    return { user, tokens: await app.get(SessionService).create(user) };
  }

  test('only one refresh wins a database race; reuse revokes the resulting session', async () => {
    const { tokens } = await createSession();
    const responses = await Promise.all([0, 1].map(() => request(app.getHttpServer())
      .patch('/refresh').set('Cookie', `refreshToken=${tokens.refresh_token}`)));
    expect(responses.map((response) => response.status).sort()).toEqual([200, 401]);
    const winner = responses.find((response) => response.status === 200)!;
    await request(app.getHttpServer()).patch('/refresh')
      .set('Cookie', `refreshToken=${winner.body.refresh_token}`).expect(401);
    await request(app.getHttpServer()).get('/me')
      .set('Authorization', `Bearer ${winner.body.access_token}`).expect(401);
  });

  test('logout persists revocation of access and refresh tokens', async () => {
    const { user, tokens } = await createSession();
    await request(app.getHttpServer()).post('/logout')
      .set('Cookie', `refreshToken=${tokens.refresh_token}`).expect(200);
    const session = await prisma.authSession.findFirstOrThrow({ where: { userId: user.id } });
    expect(session.revokedAt).toBeInstanceOf(Date);
    await request(app.getHttpServer()).get('/me')
      .set('Authorization', `Bearer ${tokens.access_token}`).expect(401);
    await request(app.getHttpServer()).patch('/refresh')
      .set('Cookie', `refreshToken=${tokens.refresh_token}`).expect(401);
  });

  test('password change invalidates all persisted sessions atomically', async () => {
    const { user, tokens } = await createSession();
    const other = await app.get(SessionService).create(user);
    await request(app.getHttpServer()).patch('/account/password')
      .set('Authorization', `Bearer ${tokens.access_token}`)
      .send({ currentPassword: 'strong-password', newPassword: 'new-strong-password' }).expect(204);
    expect((await prisma.user.findUniqueOrThrow({ where: { id: user.id } })).sessionVersion).toBe(1);
    for (const pair of [tokens, other]) {
      await request(app.getHttpServer()).get('/me')
        .set('Authorization', `Bearer ${pair.access_token}`).expect(401);
      await request(app.getHttpServer()).patch('/refresh')
        .set('Cookie', `refreshToken=${pair.refresh_token}`).expect(401);
    }
  });
});
