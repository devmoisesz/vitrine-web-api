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

describe('Register Product (E2E)', () => {
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

  test('[POST] stores/:slug/products', async () => {
    const uniqueEmail = makeEmail();

    const user = await prisma.user.create({
      data: {
        name: 'John doe',
        email: uniqueEmail,
        password: await hash('123456', 8),
      },
    });

    const uniqueWhatsapp = makeWhatsapp()

    const store = await prisma.store.create({
      data: {
        name: 'store 013',
        slug: 'store-013',
        whatsapp: uniqueWhatsapp
      },
    });

    const category = await prisma.category.create({
        data: {
            name: 'category',
            slug: 'category'
        }
    })

    const subcategory = await prisma.subCategory.create({
        data: {
            name: 'subcategory',
            slug: 'subcategory',
            categoryId: category.id
        }
    })

    await prisma.collaborator.create({
        data: {
            userId: user.id,
            storeId: store.id,
            role: 'FUNCIONARIO'
        }
    })

    const accessToken = jwt.sign({ role: user.role }, { subject: user.id });

    const response = await request(app.getHttpServer())
      .post(`/stores/${store.slug}/products`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name_product: 'Product White',
        tags: ['white', 'product'],
        description: 'Product White',
        price: 69.79,
        stock: 39,
        name_category: category.name,
        name_subcategory: subcategory.name
      });

    expect(response.statusCode).toBe(201);

    const productOnDatabase = await prisma.product.findMany({
      where: {
        name: 'Product White'
      },
    });

    expect(productOnDatabase).toBeTruthy();
  });
});
