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
import { JwtService } from '@nestjs/jwt';
import cookieParser from 'cookie-parser';
import { faker } from '@faker-js/faker';

describe('Update User Address (E2E)', () => {
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

    app.use(cookieParser());

    prisma = app.get(PrismaService);
    jwt = moduleRef.get(JwtService);

    await app.init();
    await prisma.$connect();
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  test('[PUT] /me/addressess/:addressId', async () => {
    const uniqueEmail = makeEmail();

    const user = await prisma.user.create({
      data: {
        name: 'fulano',
        email: uniqueEmail,
        password: await hash('123456', 8),
      },
    });

    const address = await prisma.address.create({
      data: {
        userId: user.id,
        city: 'Miami',
        neighborhood: 'Mid Beach',
        state: faker.location.state(),
      },
    });

    const accessToken = jwt.sign({ role: user.role }, { subject: user.id });

    const response = await request(app.getHttpServer())
      .put(`/me/addressess/${address.id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        neighborhood: 'Long Beach',
      });

    expect(response.statusCode).toBe(204);

    const addressOnDatabase = await prisma.address.findFirst({
      where: {
        neighborhood: 'Long Beach',
      },
    });

    expect(addressOnDatabase).toBeTruthy();
  });
});
