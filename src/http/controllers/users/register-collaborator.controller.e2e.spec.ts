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
import { Slug } from '@/use-cases/types/slug';
import { JwtService } from '@nestjs/jwt';
import { DatabaseModule } from '@/database/database.module';
import { randomUUID } from 'node:crypto';

describe('Register collaborator (E2E)', () => {
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
    prisma = app.get(PrismaService);
    jwt = moduleRef.get(JwtService);

    await app.init();
    await prisma.$connect();
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  test('[POST] /stores/:storeId/collaborators', async () => {
    const uniqueEmail = makeEmail();

    const user = await prisma.user.create({
      data: {
        name: 'John doe',
        email: uniqueEmail,
        password: await hash('123456', 8),
      },
    });

    const store = await prisma.store.create({
      data: {
        name: 'store',
        description: 'description',
        slug: Slug.createFromText('store'),
        whatsapp: '1722222222',
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
      .post(`/stores/${store.id}/collaborators`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'John doe',
        email: 'johndoe@example.com',
        password: '1234567',
        role: 'Funcionário',
      });

    expect(response.statusCode).toBe(201);

    const collaboratorOnDatabase = await prisma.collaborator.findUnique({
      where: {
        userId: user.id,
        storeId: store.id,
      },
    });

    expect(collaboratorOnDatabase).toBeTruthy();
  });
});
