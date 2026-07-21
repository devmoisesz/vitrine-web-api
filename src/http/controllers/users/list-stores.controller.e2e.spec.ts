import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { PrismaService } from '../../../database/prisma/prisma.service';
import { AppModule } from '../../../app.module';
import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { DatabaseModule } from '@/database/database.module';
import cookieParser from 'cookie-parser';
import { makeWhatsapp } from '../../../../test/factories/make-whatsapp';
import { SlugGeneratorService } from '@/use-cases/utils/generate-slug.service';

describe('List Stores (E2E)', () => {
  let app: INestApplication;
  let prisma: PrismaClient;
  let slugUnique: SlugGeneratorService;

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

    slugUnique = app.get(SlugGeneratorService);

    await app.init();
    await prisma.$connect();
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  test('[GET] /stores', async () => {
    for (let i = 0; i < 3; i++) {
      await prisma.store.create({
        data: {
          name: 'Pants White',
          slug: await slugUnique.execute('Pants White'),
          description: 'Pants White Masculine',
          whatsapp: makeWhatsapp(),
          status: 'ATIVA',
        },
      });
    }

    await prisma.store.create({
      data: {
        name: 'Pants Black',
        slug: await slugUnique.execute('Pants Black'),
        description: 'Pants Black Masculine',
        whatsapp: makeWhatsapp(),
        status: 'ATIVA',
      },
    });

    const response = await request(app.getHttpServer()).get(
      `/stores?name=black&page=1`,
    );

    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body).toHaveLength(1);
    expect(response.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: 'Pants Black',
          description: 'Pants Black Masculine',
          status: 'ATIVA',
        }),
      ]),
    );
  });
});
