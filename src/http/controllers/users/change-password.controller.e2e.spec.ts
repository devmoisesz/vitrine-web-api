import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { PrismaService } from '../../../database/prisma/prisma.service';
import { AppModule } from '../../../app.module';
import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { compare, hash } from 'bcryptjs';
import { makeEmail } from '../../../../test/factories/make-email';
import { JwtService } from '@nestjs/jwt';

describe('Change Password (E2E)', () => {
  let app: INestApplication;
  let prisma: PrismaClient;
  let jwt: JwtService;

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
    jwt = app.get(JwtService);

    await app.init();
    await prisma.$connect();
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  test('[PATCH] /account/password', async () => {
    const uniqueEmail = makeEmail();

    const user = await prisma.user.create({
      data: {
        name: 'john doe',
        email: uniqueEmail,
        password: await hash('123456', 8),
      },
    });

    const accessToken = jwt.sign({ role: user.role }, { subject: user.id });

    const response = await request(app.getHttpServer())
      .patch('/account/password')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        currentPassword: '123456',
        newPassword: '654321'
      });

    expect(response.statusCode).toBe(204);

    const userOnDatebase = await prisma.user.findUnique({
      where: {
        email: uniqueEmail,
      },
    });

    const newPassword = await compare('654321', userOnDatebase?.password!)

    expect(newPassword).toBeTruthy();
  });
});
