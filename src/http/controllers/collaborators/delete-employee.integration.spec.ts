import type { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { Test } from '@nestjs/testing';
import { generateKeyPairSync } from 'node:crypto';
import request from 'supertest';
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import { JwtStrategy } from '@/auth/jwt.strategy';
import { PrismaService } from '@/database/prisma/prisma.service';
import { CollaboratorsRepository } from '@/database/repositories/collaborators-repository';
import { StoresRepository } from '@/database/repositories/stores-repository';
import { EnvService } from '@/env/env.service';
import { DeleteEmployeeService } from '@/use-cases/services/collaborators/delete-employee.service';
import { CollaboratorsInMemoryRepository } from '../../../../test/in-memory-repository/collaborators-in-memory-repository';
import { StoresInMemoryRepository } from '../../../../test/in-memory-repository/stores-in-memory-repository';
import { makeStore } from '../../../../test/factories/make-store';
import { DeleteEmployeeController } from './delete-employee.controller';

describe('SEG-02 employee ownership (HTTP integration)', () => {
  let app: INestApplication;
  let jwt: JwtService;
  const stores = new StoresInMemoryRepository();
  const collaborators = new CollaboratorsInMemoryRepository();

  beforeAll(async () => {
    const { privateKey, publicKey } = generateKeyPairSync('rsa', {
      modulusLength: 2048,
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
      publicKeyEncoding: { type: 'spki', format: 'pem' },
    });
    jwt = new JwtService({ privateKey, signOptions: { algorithm: 'RS256' } });
    const moduleRef = await Test.createTestingModule({
      imports: [PassportModule],
      controllers: [DeleteEmployeeController],
      providers: [
        JwtStrategy,
        DeleteEmployeeService,
        { provide: CollaboratorsRepository, useValue: collaborators },
        { provide: StoresRepository, useValue: stores },
        {
          provide: EnvService,
          useValue: { get: () => Buffer.from(publicKey).toString('base64') },
        },
        {
          provide: PrismaService,
          useValue: {
            store: {
              findUnique: async ({ where }: { where: { slug: string } }) =>
                stores.findBySlug(where.slug),
            },
            collaborator: {
              findFirst: async ({
                where,
              }: {
                where: { userId: string; storeId: string };
              }) =>
                collaborators.findByUserAndStore(where.userId, where.storeId),
            },
          },
        },
      ],
    }).compile();
    app = moduleRef.createNestApplication();
    await app.init();
    vi.spyOn(collaborators, 'delete');
  });

  beforeEach(async () => {
    stores.items = [];
    collaborators.items = [];
    for (const suffix of ['a', 'b']) {
      await makeStore(stores, {
        id: `store-${suffix}`,
        slug: `loja-${suffix}`,
      });
      await collaborators.create({
        id: `owner-${suffix}`,
        userId: `owner-user-${suffix}`,
        storeId: `store-${suffix}`,
        role: 'PROPRIETARIO',
      });
      await collaborators.create({
        id: `employee-${suffix}`,
        userId: `employee-user-${suffix}`,
        storeId: `store-${suffix}`,
        role: 'FUNCIONARIO',
      });
    }
    vi.clearAllMocks();
  });

  afterAll(async () => {
    await app?.close();
    vi.restoreAllMocks();
  });

  function remove(subject: string, slug: string, employeeId: string) {
    return request(app.getHttpServer())
      .delete(`/store/${slug}/delete/${employeeId}`)
      .set(
        'Authorization',
        `Bearer ${jwt.sign({ role: 'USER' }, { subject })}`,
      );
  }

  it.each([
    ['owner-user-a', 'loja-a', 'employee-b'],
    ['owner-user-b', 'loja-b', 'employee-a'],
    ['owner-user-a', 'loja-a', 'owner-b'],
    ['owner-user-a', 'loja-a', 'missing'],
  ])(
    'rejects %s deleting %s/%s without changing any collaborator',
    async (subject, slug, employeeId) => {
      const before = JSON.stringify(collaborators.items);
      await remove(subject, slug, employeeId).expect(404);
      expect(JSON.stringify(collaborators.items)).toBe(before);
      expect(collaborators.delete).not.toHaveBeenCalled();
    },
  );

  it.each(['a', 'b'])(
    'allows the owner of store %s to delete only their employee',
    async (suffix) => {
      const expected = collaborators.items.filter(
        (member) => member.id !== `employee-${suffix}`,
      );
      await remove(
        `owner-user-${suffix}`,
        `loja-${suffix}`,
        `employee-${suffix}`,
      ).expect(204);
      expect(collaborators.items).toEqual(expected);
    },
  );

  it('still rejects deletion of the store owner', async () => {
    await remove('owner-user-a', 'loja-a', 'owner-a').expect(409);
    expect(collaborators.delete).not.toHaveBeenCalled();
  });

  it('still rejects employees on this owner-only route', async () => {
    await remove('employee-user-a', 'loja-a', 'employee-a').expect(403);
    expect(collaborators.delete).not.toHaveBeenCalled();
  });
});
