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
import { hash } from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';

describe('List Cart Products (E2E)', () => {
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

  test('[GET] /cart/:cartId/product', async () => {
    const user = await prisma.user.create({
      data: {
        name: 'John Doe',
        email: 'johndoe@example.com',
        password: await hash('123456', 8),
      },
    });

    const store = await prisma.store.create({
      data: {
        name: 'store 013',
        slug: 'store-013',
        whatsapp: makeWhatsapp(),
        status: 'ATIVA',
        logo_image_url: faker.internet.url(),
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

    const product1 = await prisma.product.create({
      data: {
        name: 'Blouse White',
        slug: 'blouse-white',
        description: 'Blouse White Feminine',
        price: 69.79,
        stock: 39,
        sizes: ['P'],
        storeId: store.id,
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
        productId: product1.id,
      },
    });

    const product2 = await prisma.product.create({
      data: {
        name: 'Pants Black',
        slug: 'pants-black',
        description: 'Pants Black Masculine',
        price: 69.79,
        stock: 39,
        sizes: ['M'],
        storeId: store.id,
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
        productId: product2.id,
      },
    });

    const cart = await prisma.cart.create({
      data: {
        storeId: store.id,
        userId: user.id,
      },
    });

    await prisma.cartItems.create({
      data: {
        quantity: 5,
        productId: product1.id,
        cartId: cart.id,
        selectedSize: 'P',
      },
    });

    await prisma.cartItems.create({
      data: {
        quantity: 5,
        productId: product2.id,
        cartId: cart.id,
        selectedSize: 'M',
      },
    });

    const accessToken = jwt.sign({ role: user.role }, { subject: user.id });

    const response = await request(app.getHttpServer())
      .get(`/cart/${cart.id}/products`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body).toHaveLength(2);
  });
});
