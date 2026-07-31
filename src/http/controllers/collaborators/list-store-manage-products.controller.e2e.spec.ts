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
import { JwtService } from '@nestjs/jwt';
import { Slug } from '@/use-cases/utils/slug';
import { hash } from 'bcryptjs';

describe('List Store Manage Products (E2E)', () => {
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
    jwt = app.get(JwtService);

    await app.init();
    await prisma.$connect();
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  test('[GET] store/:slug/manage/products', async () => {
    const employee = await prisma.user.create({
      data: {
        name: 'John Doe',
        email: 'johndoe@example',
        password: await hash('123456', 8)
      }
    })

    const store = await prisma.store.create({
      data: {
        name: 'store 013',
        slug: 'store-013',
        whatsapp: makeWhatsapp(),
      },
    });

    await prisma.collaborator.create({
      data: {
        userId: employee.id,
        storeId: store.id,
        role: 'FUNCIONARIO'
      }
    })

    const categoryBlouse = await prisma.category.create({
      data: {
        name: 'Blouse',
        slug: 'blouse',
      },
    });

    const subcategoryFeminine = await prisma.subCategory.create({
      data: {
        name: 'Feminine',
        slug: 'feminine',
        categoryId: categoryBlouse.id,
      },
    });

    for (let i = 0; i < 5; i++) {
      const product = await prisma.product.create({
        data: {
          name: faker.commerce.productName(),
          slug: Slug.createFromText(faker.commerce.productName()),
          description: 'Blouse White Feminine',
          price: 69.79,
          stock: 39,
          storeId: store.id,
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

    for (let i = 0; i < 5; i++) {
      const product = await prisma.product.create({
        data: {
          name: faker.commerce.productName(),
          slug: Slug.createFromText(faker.commerce.productName()),
          description: 'Blouse White Feminine',
          price: 69.79,
          stock: 39,
          storeId: store.id,
          categoryId: categoryBlouse.id,
          subcategoryId: subcategoryFeminine.id,
          status: 'INATIVO',
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

    const accessToken = jwt.sign({ role: employee.role }, { subject: employee.id });

    const response = await request(app.getHttpServer())
      .get(`/store/${store.slug}/manage/products?categoryId=${categoryBlouse.id}&subcategoryId=${subcategoryFeminine.id}&status=INATIVO&page=1`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body).toHaveLength(5);
  });
});
