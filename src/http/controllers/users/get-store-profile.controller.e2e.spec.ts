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
import { DatabaseModule } from '@/database/database.module';
import cookieParser from 'cookie-parser';
import { makeWhatsapp } from '../../../../test/factories/make-whatsapp';
import { faker } from '@faker-js/faker';

describe('Get Store Profile (E2E)', () => {
  let app: INestApplication;
  let prisma: PrismaClient;

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

    app.use(cookieParser());

    prisma = app.get(PrismaService);

    await app.init();
    await prisma.$connect();
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  test('[GET] /store/:slug', async () => {
    const userEmail = makeEmail();
    const storeEmail = makeEmail();

    await prisma.user.create({
      data: {
        name: 'John doe',
        email: userEmail,
        password: await hash('123456', 8),
      },
    });

    const store = await prisma.store.create({
      data: {
        name: 'fake store',
        slug: 'fake-store',
        email: storeEmail,
        whatsapp: makeWhatsapp(),
        description: 'Fake Description',
      },
    });

    await prisma.address.create({
      data: {
        storeId: store.id,
        city: 'Miami',
        neighborhood: 'Mid Beach',
        state: faker.location.state(),
      },
    });

    const response = await request(app.getHttpServer())
      .get(`/store/${store.slug}`)
      .send();

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual(
      expect.objectContaining({
        name: store.name,
        description: store.description,
      }),
    );
  });
});
