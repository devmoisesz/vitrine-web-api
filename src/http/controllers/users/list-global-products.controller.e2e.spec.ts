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

describe('List Global Products (E2E)', () => {
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

    const category = await prisma.category.create({
      data: {
        name: 'category',
        slug: 'category',
      },
    });

    const subcategory = await prisma.subCategory.create({
      data: {
        name: 'subcategory',
        slug: 'subcategory',
        categoryId: category.id,
      },
    });

    for (let i = 0; i < 3; i++) {
      const product = await prisma.product.create({
        data: {
          name: 'Product Black',
          slug: 'product-black',
          description: 'Product Black',
          price: 69.79,
          stock: 39,
          storeId: stores[i].id,
          categoryId: category.id,
          subcategoryId: subcategory.id,
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
          name: 'Product White',
          slug: 'product-white',
          description: 'Product White',
          price: 69.79,
          stock: 39,
          storeId: stores[i].id,
          categoryId: category.id,
          subcategoryId: subcategory.id,
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
      `/products?name=black&page=1`,
    );

    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body).toHaveLength(3);
    expect(response.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: 'Product Black',
          status: 'ATIVO',
        }),
      ]),
    );
  });
});
