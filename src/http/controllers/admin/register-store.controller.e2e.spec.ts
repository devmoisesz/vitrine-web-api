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
import { makeWhatsapp } from '../../../../test/factories/make-whatsapp';

describe('Register Store (E2E)', () => {
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
    prisma = app.get(PrismaService);
    sessions = moduleRef.get(SessionService);

    await app.init();
    await prisma.$connect();
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  test('[POST] /store/', async () => {
    const uniqueEmail = makeEmail();

    const user = await prisma.user.create({
      data: {
        name: 'John doe',
        email: uniqueEmail,
        password: await hash('123456', 8),
        role: 'ADMIN'
      },
    });

    const accessToken = (await sessions.create(user)).access_token;

    const uniqueWhatsapp = makeWhatsapp()

    const response = await request(app.getHttpServer())
      .post(`/store`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        store_name: 'store',
        store_email: 'store@example.com',
        owner_email: uniqueEmail,
        whatsapp: uniqueWhatsapp
      });

    expect(response.statusCode).toBe(201);

    const storeOnDatabase = await prisma.store.findUnique({
      where: {
        whatsapp: uniqueWhatsapp
      },
    });

    expect(storeOnDatabase).toBeTruthy();
  });
});
