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
import { AddressRepository } from '@/database/repositories/addresses-repository';
import { UsersRepository } from '@/database/repositories/users-repository';
import { EnvService } from '@/env/env.service';
import { UpdateUserAddressService } from '@/use-cases/services/address/update-user-address.service';
import { AddressInMemoryRepository } from '../../../../test/in-memory-repository/addresses-in-memory-repository';
import { UsersInMemoryRepository } from '../../../../test/in-memory-repository/users-in-memory-repository';
import { UpdateUserAddresController } from './update-user-address.controller';

describe('SEG-03 personal address ownership (HTTP integration)', () => {
  let app: INestApplication;
  let jwt: JwtService;
  const addresses = new AddressInMemoryRepository();
  const users = new UsersInMemoryRepository();

  beforeAll(async () => {
    const { privateKey, publicKey } = generateKeyPairSync('rsa', {
      modulusLength: 2048,
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
      publicKeyEncoding: { type: 'spki', format: 'pem' },
    });
    jwt = new JwtService({ privateKey, signOptions: { algorithm: 'RS256' } });
    const moduleRef = await Test.createTestingModule({
      imports: [PassportModule],
      controllers: [UpdateUserAddresController],
      providers: [
        JwtStrategy,
        UpdateUserAddressService,
        { provide: AddressRepository, useValue: addresses },
        { provide: UsersRepository, useValue: users },
        {
          provide: EnvService,
          useValue: { get: () => Buffer.from(publicKey).toString('base64') },
        },
      ],
    }).compile();
    app = moduleRef.createNestApplication();
    await app.init();
    vi.spyOn(addresses, 'saveForUser');
  });

  beforeEach(async () => {
    addresses.items = [];
    users.items = [];
    for (const suffix of ['a', 'b']) {
      await users.create({
        id: `user-${suffix}`,
        name: `User ${suffix}`,
        email: `${suffix}@example.com`,
        password: 'unused',
      });
    }
    for (const [id, userId, storeId] of [
      ['address-a', 'user-a', null],
      ['address-b', 'user-b', null],
      ['store-address', null, 'store-a'],
      ['mixed-address', 'user-a', 'store-b'],
      ['unowned-address', null, null],
    ]) {
      await addresses.create({
        id: id!,
        userId,
        storeId,
        state: 'SP',
        city: 'São Paulo',
        neighborhood: 'Centro',
        street: 'Rua A',
        number: '10',
        complement: null,
      });
    }
    vi.clearAllMocks();
  });

  afterAll(async () => {
    await app?.close();
    vi.restoreAllMocks();
  });

  function edit(
    userId: string,
    addressId: string,
    body: Record<string, unknown> = { city: 'Campinas' },
  ) {
    return request(app.getHttpServer())
      .put(`/me/addressess/${addressId}`)
      .set(
        'Authorization',
        `Bearer ${jwt.sign({ role: 'USER' }, { subject: userId })}`,
      )
      .send(body);
  }

  it.each([
    ['user-a', 'address-b'],
    ['user-b', 'address-a'],
    ['user-a', 'store-address'],
    ['user-a', 'mixed-address'],
    ['user-a', 'unowned-address'],
    ['user-a', 'missing'],
  ])(
    'rejects %s editing %s without modifying any address',
    async (userId, addressId) => {
      const before = JSON.stringify(addresses.items);
      await edit(userId, addressId).expect(404);
      expect(JSON.stringify(addresses.items)).toBe(before);
      expect(addresses.saveForUser).not.toHaveBeenCalled();
    },
  );

  it.each(['a', 'b'])(
    'allows user %s to edit their own address and preserves all other fields',
    async (suffix) => {
      const addressId = `address-${suffix}`;
      const before = { ...(await addresses.findById(addressId))! };
      const others = JSON.stringify(
        addresses.items.filter((address) => address.id !== addressId),
      );

      await edit(`user-${suffix}`, addressId).expect(204);

      expect(await addresses.findById(addressId)).toMatchObject({
        ...before,
        city: 'Campinas',
        updatedAt: expect.any(Date),
      });
      expect(
        JSON.stringify(
          addresses.items.filter((address) => address.id !== addressId),
        ),
      ).toBe(others);
    },
  );

  it('cannot impersonate the owner through body fields', async () => {
    const before = JSON.stringify(addresses.items);
    await edit('user-a', 'address-b', {
      city: 'Campinas',
      userId: 'user-b',
      sub: 'user-b',
    }).expect(404);
    expect(JSON.stringify(addresses.items)).toBe(before);
    expect(addresses.saveForUser).not.toHaveBeenCalled();
  });

  it('does not reassign ownership or identity through body fields', async () => {
    await edit('user-a', 'address-a', {
      city: 'Campinas',
      id: 'address-b',
      userId: 'user-b',
      storeId: 'store-a',
    }).expect(204);
    expect(await addresses.findById('address-a')).toMatchObject({
      city: 'Campinas',
      userId: 'user-a',
      storeId: null,
    });
    expect(await addresses.findById('address-b')).toMatchObject({
      city: 'São Paulo',
      userId: 'user-b',
      storeId: null,
    });
  });

  it('rejects an authenticated token for a user that no longer exists', async () => {
    await edit('missing-user', 'address-a').expect(401);
    expect(addresses.saveForUser).not.toHaveBeenCalled();
  });

  it('rejects a signed token without a subject', async () => {
    await request(app.getHttpServer())
      .put('/me/addressess/address-a')
      .set('Authorization', `Bearer ${jwt.sign({ role: 'USER' })}`)
      .send({ city: 'Campinas' })
      .expect(401);
    expect(addresses.saveForUser).not.toHaveBeenCalled();
  });

  it('requires authentication', async () => {
    await request(app.getHttpServer())
      .put('/me/addressess/address-a')
      .send({ city: 'Campinas' })
      .expect(401);
    expect(addresses.saveForUser).not.toHaveBeenCalled();
  });
});
