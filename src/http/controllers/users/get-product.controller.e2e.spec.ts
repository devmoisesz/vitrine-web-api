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

describe('Get Product (E2E)', () => {
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

  test('[GET] /products/:productId', async () => {
    const store = await prisma.store.create({
      data: {
        name: 'store 013',
        slug: 'store-013',
        whatsapp: makeWhatsapp(),
      },
    });

    const category = await prisma.category.create({
      data: {
        name: 'Pants',
        slug: 'pants',
      },
    });

    const subcategory = await prisma.subCategory.create({
      data: {
        name: 'Masculine',
        slug: 'masculine',
        categoryId: category.id,
      },
    });

    const product = await prisma.product.create({
      data: {
        name: 'Pants Black',
        slug: 'pants-black',
        description: 'Pants Black Masculine',
        price: 69.79,
        stock: 39,
        storeId: store.id,
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
    await prisma.productImages.create({
      data: {
        image_url: faker.internet.url(),
        storage_public_id: randomUUID(),
        is_main: false,
        productId: product.id,
      },
    });
    await prisma.productImages.create({
      data: {
        image_url: faker.internet.url(),
        storage_public_id: randomUUID(),
        is_main: false,
        productId: product.id,
      },
    });

    const response = await request(app.getHttpServer()).get(
      `/products/${product.id}`,
    );

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual(
      expect.objectContaining({
        product: expect.objectContaining({
          name: 'Pants Black',
          description: 'Pants Black Masculine',
          status: 'ATIVO',
        }),
      }),
    );
  });
});
