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
import { DatabaseModule } from '@/database/database.module';
import cookieParser from 'cookie-parser';

describe('List Employees (E2E)', () => {
  let app: INestApplication;
  let prisma: PrismaClient;
  let jwt: JwtService;

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
    jwt = moduleRef.get(JwtService);

    await app.init();
    await prisma.$connect();
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  test('[GET] /store/:slug/employees', async () => {
    const userEmail = makeEmail();
    const storeEmail = makeEmail();

    const owner = await prisma.user.create({
      data: {
        name: 'Owner',
        email: userEmail,
        password: await hash('123456', 8),
      },
    });

    const user = await prisma.user.create({
      data: {
        name: 'John doe',
        email: 'johndoe@example.com',
        password: await hash('123456', 8),
      },
    });

    const store = await prisma.store.create({
      data: {
        name: 'fake store',
        slug: 'fake-store',
        email: storeEmail,
        whatsapp: '19876526587',
      },
    });

    await prisma.collaborator.create({
      data: {
        userId: owner.id,
        storeId: store.id,
        role: 'Proprietário'
      },
    }),

    await prisma.collaborator.create({
        data: {
          userId: user.id,
          storeId: store.id,
          role: 'Funcionário'
        },
    });

    const accessToken = jwt.sign({ role: owner.role }, { subject: owner.id });

    const response = await request(app.getHttpServer())
      .get(`/store/${store.slug}/employees`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send();

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          email: 'johndoe@example.com',
        }),
      ]),
    );
  });
});
