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

describe('Authenticate (E2E)', () => {
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
    prisma = app.get(PrismaService);

    await app.init();
    await prisma.$connect();
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  test('[POST] /authenticate', async () => {
    const uniqueEmail = makeEmail()

    await prisma.user.create({
        data: {
            name: 'john doe',
            email: uniqueEmail,
            password: await hash('123456', 8)
        }
    })

    const response = await request(app.getHttpServer()).post('/authenticate').send({
      email: uniqueEmail,
      password: '123456',
    });

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
        access_token: expect.any(String),
        refresh_token: expect.any(String)
    })

    const userOnDatebase = await prisma.user.findUnique({
      where: {
        email: uniqueEmail,
      },
    });

    expect(userOnDatebase).toBeTruthy();
  });
});
