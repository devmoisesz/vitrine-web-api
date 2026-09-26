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
import { SlugGeneratorService } from '@/use-cases/utils/generate-slug.service';

describe('Register collaborator (E2E)', () => {
  let app: INestApplication;
  let prisma: PrismaClient;
  let sessions: SessionService;
  let slugGenerator: SlugGeneratorService

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
    slugGenerator = moduleRef.get(SlugGeneratorService);

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
        slug: await slugGenerator.execute('store'),
        whatsapp: '1722222222',
      },
    });

    await prisma.collaborator.create({
        data: {
            userId: user.id,
            storeId: store.id,
            role: 'PROPRIETARIO'
        }
    })

    const accessToken = (await sessions.create(user)).access_token;

    const response = await request(app.getHttpServer())
      .post(`/stores/${store.slug}/collaborators`)
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
