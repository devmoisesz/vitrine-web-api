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
import { faker } from '@faker-js/faker';
import { randomUUID } from 'node:crypto';

describe('List Products (E2E)', () => {
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

  test('[GET] /products', async () => {
    await prisma.store.create({
      data: {
        name: 'store 013',
        slug: 'store-013',
        whatsapp: makeWhatsapp(),
      },
    });

    await prisma.store.create({
      data: {
        name: 'store 014',
        slug: 'store-014',
        whatsapp: makeWhatsapp(),
      },
    });

    await prisma.store.create({
      data: {
        name: 'store 015',
        slug: 'store-015',
        whatsapp: makeWhatsapp(),
      },
    });

    const stores = await prisma.store.findMany({
      where: {
        status: 'ATIVA',
      },
    });

    const categoryBlouse = await prisma.category.create({
      data: {
        name: 'Blouse',
        slug: 'blouse',
      },
    });

    const categoryPants = await prisma.category.create({
      data: {
        name: 'Pants',
        slug: 'pants',
      },
    });

    const subcategoryMasculine = await prisma.subCategory.create({
      data: {
        name: 'Masculine',
        slug: 'masculine',
        categoryId: categoryPants.id,
      },
    });

    const subcategoryFeminine = await prisma.subCategory.create({
      data: {
        name: 'Feminine',
        slug: 'feminine',
        categoryId: categoryBlouse.id,
      },
    });

    for (let i = 0; i < 3; i++) {
      const product = await prisma.product.create({
        data: {
          name: 'Blouse White',
          slug: 'blouse-white',
          description: 'Blouse White Feminine',
          price: 69.79,
          stock: 39,
          storeId: stores[i].id,
          categoryId: categoryBlouse.id,
          subcategoryId: subcategoryFeminine.id,
          status: 'ATIVO',
        },
      });

      await prisma.productImages.create({
        data: {
          image_url: faker.internet.url(),
          storage_public_id: randomUUID(),
          is_main: true,
          productId: product.id,
        },
      });
    }

    for (let i = 0; i < 3; i++) {
      const product = await prisma.product.create({
        data: {
          name: 'Pants Black',
          slug: 'pants-black',
          description: 'Pants Black Masculine',
          price: 69.79,
          stock: 39,
          storeId: stores[i].id,
          categoryId: categoryPants.id,
          subcategoryId: subcategoryMasculine.id,
          status: 'ATIVO',
        },
      });

      await prisma.productImages.create({
        data: {
          image_url: faker.internet.url(),
          storage_public_id: randomUUID(),
          is_main: true,
          productId: product.id,
        },
      });
    }

    const response = await request(app.getHttpServer()).get(
      `/products?name=pants%20black&categoryId=${categoryPants.id}&subcategoryId=${subcategoryMasculine.id}&page=1`,
    );

    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body).toHaveLength(3);
    expect(response.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: 'Pants Black',
          description: 'Pants Black Masculine',
          status: 'ATIVO',
        }),
      ]),
    );
  });
});
