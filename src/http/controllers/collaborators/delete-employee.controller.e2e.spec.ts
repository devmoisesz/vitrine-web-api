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
import { makeWhatsapp } from '../../../../test/factories/make-whatsapp';

describe('Delete Employee (E2E)', () => {
  let app: INestApplication;
  let prisma: PrismaClient;
  let jwt: JwtService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
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
    prisma = app.get(PrismaService);
    jwt = moduleRef.get(JwtService)

    await app.init();
    await prisma.$connect();
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  test('[DELETE] /store/:slug/delete/:employeeId', async () => {
    const ownerEmail = makeEmail();
    const userEmail = makeEmail();
    const storeEmail = makeEmail();

    const owner = await prisma.user.create({
      data: {
        name: 'john doe',
        email: ownerEmail,
        password: await hash('123456', 8),
      },
    });

    const user = await prisma.user.create({
      data: {
        name: 'fulano',
        email: userEmail,
        password: await hash('123456', 8),
      },
    });

    const store = await prisma.store.create({
        data: {
            name: 'fake store',
            slug: 'fake-store',
            email: storeEmail,
            whatsapp: makeWhatsapp(),
            description: 'Fake Description'
        }
    })

    await prisma.collaborator.create({
        data: {
            userId: owner.id,
            storeId: store.id,
            role: 'PROPRIETARIO'
        }
    })

    const employee = await prisma.collaborator.create({
        data: {
            userId: user.id,
            storeId: store.id,
            role: 'FUNCIONARIO'
        }
    })

    const accessToken = jwt.sign({ role: owner.role }, { subject: owner.id });

    const response = await request(app.getHttpServer())
      .delete(`/store/${store.slug}/delete/${employee.id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        newName: 'store fake'
      });

    expect(response.statusCode).toBe(204);

    // const employeeOnDatabase = await prisma.collaborator.findUnique({
    //     where: {
    //         userId: employee.id
    //     }
    // })

    // expect(employeeOnDatabase).not.toBeTruthy()
  });
});
