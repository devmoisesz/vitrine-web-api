import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { PrismaService } from '../../../database/prisma/prisma.service';
import { AppModule } from '../../../app.module';
import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { makeEmail } from '../../../../test/factories/make-email';
import { hash } from 'bcryptjs';
import { SessionService } from '@/auth/session.service';
import { DatabaseModule } from '@/database/database.module';
import cookieParser from 'cookie-parser';

describe('Get Profile (E2E)', () => {
  let app: INestApplication;
  let prisma: PrismaClient;
  let sessions: SessionService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
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
    sessions = moduleRef.get(SessionService);

    await app.init();
    await prisma.$connect();
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  test('[GET] /me', async () => {
    const uniqueEmail = makeEmail();

    const user = await prisma.user.create({
      data: {
        name: 'John doe',
        email: uniqueEmail,
        password: await hash('123456', 8),
      },
    });

    const accessToken = (await sessions.create(user)).access_token;

    const response = await request(app.getHttpServer())
      .get(`/me`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send();

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual(
        expect.objectContaining({
            user_name: user.name,
            user_email: user.email,
            user_role: 'Cliente',
            user_address: []
        }),
    )
  });
});
