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
import { makeWhatsapp } from '../../../../test/factories/make-whatsapp';

describe('Register Store Address (E2E)', () => {
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

  test('[POST] address/:slug/register', async () => {
    const uniqueEmail = makeEmail();

    const user = await prisma.user.create({
      data: {
        name: 'John doe',
        email: uniqueEmail,
        password: await hash('123456', 8),
      },
    });

    const uniqueWhatsapp = makeWhatsapp()

    const store = await prisma.store.create({
      data: {
        name: 'store 013',
        slug: 'store-013',
        whatsapp: uniqueWhatsapp
      },
    });

    await prisma.collaborator.create({
        data: {
            userId: user.id,
            storeId: store.id,
            role: 'Proprietário'
        }
    })

    const accessToken = jwt.sign({ role: user.role }, { subject: user.id });

    const response = await request(app.getHttpServer())
      .post(`/address/${store.slug}/register`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        label: 'Home',
        state: 'SP',
        city: 'Miami',
        neighborhood: 'Long Beach',
      });

    expect(response.statusCode).toBe(201);

    const addressOnDatabase = await prisma.address.findMany({
      where: {
        storeId: store.id
      },
    });

    expect(addressOnDatabase).toBeTruthy();
  });
});
