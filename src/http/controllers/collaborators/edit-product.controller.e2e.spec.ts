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
import { JwtService } from '@nestjs/jwt';
import { DatabaseModule } from '@/database/database.module';
import cookieParser from 'cookie-parser';
import { makeWhatsapp } from '../../../../test/factories/make-whatsapp';

describe('Edit Product (E2E)', () => {
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

  test('[PUT] /stores/:slug/products/:productId', async () => {
    const uniqueEmail = makeEmail();

    const user = await prisma.user.create({
      data: {
        name: 'John doe',
        email: uniqueEmail,
        password: await hash('123456', 8),
      },
    });

    const uniqueWhatsapp = makeWhatsapp();

    const store = await prisma.store.create({
      data: {
        name: 'store 013',
        slug: 'store-013',
        whatsapp: uniqueWhatsapp,
      },
    });

    const firstCategory = await prisma.category.create({
      data: {
        name: 'category',
        slug: 'category',
      },
    });

    const firstSubcategory = await prisma.subCategory.create({
      data: {
        name: 'subcategory',
        slug: 'subcategory',
        categoryId: firstCategory.id,
      },
    });

    const newCategory = await prisma.category.create({
      data: {
        name: 'new category',
        slug: 'new-category',
      },
    });

    const newSubcategory = await prisma.subCategory.create({
      data: {
        name: 'new subcategory',
        slug: 'new-subcategory',
        categoryId: newCategory.id,
      },
    });

    await prisma.collaborator.create({
      data: {
        userId: user.id,
        storeId: store.id,
        role: 'FUNCIONARIO',
      },
    });

    const product = await prisma.product.create({
      data: {
        name: 'Product White',
        slug: 'product-white',
        description: 'Product White',
        price: 69.79,
        sizes: ["42", "44"],
        stock: 39,
        storeId: store.id,
        categoryId: firstCategory.id,
        subcategoryId: firstSubcategory.id,
      },
    });

    const accessToken = jwt.sign({ role: user.role }, { subject: user.id });

    const response = await request(app.getHttpServer())
      .put(`/stores/${store.slug}/products/${product.id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name_product: 'Product Black',
        tags: ['black', 'product'],
        description: 'Product Black',
        price: 40.15,
        sizes: ["40", "42", "44"],
        stock: 71,
        name_category: newCategory.name,
        name_subcategory: newSubcategory.name,
      });

    expect(response.statusCode).toBe(204);

    const productOnDatabase = await prisma.product.findMany({
      where: {
        slug: 'product-black',
      },
    });

    expect(productOnDatabase).toBeTruthy();
  });
});
