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

describe('List Orders (E2E)', () => {
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

  test('[GET] /store/:slug/orders', async () => {
    // As propriedades estão dividas em 1 e 2 para que seja possível criar 2 pedidos em lojas diferentes, e assim testar se o endpoint retorna apenas os pedidos da loja requisitada.

    const user = await prisma.user.create({
      data: {
        name: 'John Doe',
        email: 'johndoe@example.com',
        password: await hash('123456', 8),
      },
    });

    const store1 = await prisma.store.create({
      data: {
        name: 'store 013',
        slug: 'store-013',
        whatsapp: makeWhatsapp(),
        status: 'ATIVA',
        logo_image_url: faker.internet.url(),
      },
    });

    const store2 = await prisma.store.create({
      data: {
        name: 'store 014',
        slug: 'store-014',
        whatsapp: makeWhatsapp(),
        status: 'ATIVA',
        logo_image_url: faker.internet.url(),
      },
    });

    await prisma.collaborator.create({
        data: {
            userId: user.id,
            storeId: store1.id,
            role: 'FUNCIONARIO'
        }
    })

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
        storeId: store1.id,
        categoryId: categoryPants.id,
        subcategoryId: subcategoryMasculine.id,
        status: 'ATIVO',
      },
    });

    const product2 = await prisma.product.create({
      data: {
        name: 'Blouse Black',
        slug: 'blouse-black',
        description: 'Blouse Black Feminine',
        price: 59.79,
        stock: 30,
        sizes: ['G'],
        storeId: store2.id,
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

    await prisma.productImages.create({
      data: {
        image_url: faker.internet.url(),
        storage_public_id: randomUUID(),
        is_main: true,
        productId: product2.id,
      },
    });

    const cart1 = await prisma.cart.create({
      data: {
        storeId: store1.id,
        userId: user.id,
      },
    });

    const cart2 = await prisma.cart.create({
      data: {
        storeId: store2.id,
        userId: user.id,
      },
    });

    const cartItem1 = await prisma.cartItems.create({
      data: {
        quantity: 5,
        productId: product1.id,
        cartId: cart1.id,
        selectedSize: 'P',
      },
    });

    const cartItem2 = await prisma.cartItems.create({
      data: {
        quantity: 5,
        productId: product2.id,
        cartId: cart2.id,
        selectedSize: 'G',
      },
    });

    let total1 = 0;
    let total2 = 0;

    total1 = Number(product1.price) * cartItem1.quantity;
    total2 = Number(product2.price) * cartItem2.quantity;

    const order1 = await prisma.order.create({
      data: {
        storeId: store1.id,
        userId: user.id,
        total: total1,
      },
    });

    const order2 = await prisma.order.create({
      data: {
        storeId: store2.id,
        userId: user.id,
        total: total2,
      },
    });

    await prisma.orderItems.create({
      data: {
        orderId: order1.id,
        quantity: cartItem1.quantity,
        price: product1.price,
      },
    });

    await prisma.orderItems.create({
      data: {
        orderId: order2.id,
        quantity: cartItem2.quantity,
        price: product2.price,
      },
    });

    const accessToken = jwt.sign({ role: user.role }, { subject: user.id });

    const response = await request(app.getHttpServer())
      .get(`/store/${store1.slug}/orders`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveLength(1);
  });
});
