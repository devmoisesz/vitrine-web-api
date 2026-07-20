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

describe('List Products By Category (E2E)', () => {
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

  test('[GET] /products/category/:slugCategory/subcategory/:slugSubcategory', async () => {
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

    const stores = await prisma.store.findMany()

    const store = await prisma.store.create({
      data: {
        name: 'store 016',
        slug: 'store-016',
        whatsapp: makeWhatsapp(),
      },
    });

    const category = await prisma.category.create({
      data: {
        name: 'camisetas',
        slug: 'camisetas',
      },
    });

    const subcategory1 = await prisma.subCategory.create({
      data: {
        name: 'feminina',
        slug: 'feminina',
        categoryId: category.id,
      },
    });

    const subcategory2 = await prisma.subCategory.create({
      data: {
        name: 'masculina',
        slug: 'masculina',
        categoryId: category.id,
      },
    });

    for (let i = 0; i < 3; i++) {
      const product = await prisma.product.create({
        data: {
          name: 'Camisa Feminina',
          slug: 'camisa-feminina',
          description: 'Camisa Feminina',
          price: 69.79,
          stock: 39,
          storeId: stores[i].id,
          categoryId: category.id,
          subcategoryId: subcategory1.id,
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

    const product = await prisma.product.create({
      data: {
        name: 'Camisa Masculina',
        slug: 'camisa-masculina',
        description: 'Camisa Masculina',
        price: 69.79,
        stock: 39,
        storeId: store.id,
        categoryId: category.id,
        subcategoryId: subcategory2.id,
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


    const response = await request(app.getHttpServer()).get(
      `/products/category/${category.slug}/subcategory/${subcategory2.slug}?page=1`,
    );

    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body).toHaveLength(1);
  });
});
