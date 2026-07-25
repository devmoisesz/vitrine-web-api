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

describe('List Order Products (E2E)', () => {
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

  test('[GET] /orders/:orderId', async () => {
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

    const product = await prisma.product.create({
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
        productId: product.id,
      },
    });

    const cart = await prisma.cart.create({
      data: {
        storeId: store.id,
        userId: user.id,
      },
    });

    const cartItem = await prisma.cartItems.create({
      data: {
        quantity: 5,
        productId: product.id,
        cartId: cart.id,
        selectedSize: 'M',
      },
    });

    let total = 0;

    total = Number(product.price) * cartItem.quantity;

    const order = await prisma.order.create({
      data: {
        storeId: store.id,
        userId: user.id,
        total,
      },
    });

    await prisma.orderItems.create({
      data: {
        orderId: order.id,
        productId: product.id,
        quantity: cartItem.quantity,
        price: product.price,
      },
    });

    const accessToken = jwt.sign({ role: user.role }, { subject: user.id });

    const response = await request(app.getHttpServer())
      .get(`/orders/${order.id}`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.order_items).toHaveLength(1);
  });
});
