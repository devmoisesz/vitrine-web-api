import { beforeEach, describe, expect, it } from 'vitest';
import { BadRequestException } from '@nestjs/common';
import { faker } from '@faker-js/faker';
import { AddressInMemoryRepository } from '../../../../test/in-memory-repository/addresses-in-memory-repository';
import { RegisterStoreAddressService } from './register-store-address.service';
import { makeStore } from '../../../../test/factories/make-store';
import { StoresInMemoryRepository } from '../../../../test/in-memory-repository/stores-in-memory-repository';

let storesRepository: StoresInMemoryRepository;
let addressRepository: AddressInMemoryRepository;
let sut: RegisterStoreAddressService;

describe('Register User Address Service', () => {
  beforeEach(() => {
    storesRepository = new StoresInMemoryRepository();
    addressRepository = new AddressInMemoryRepository();
    sut = new RegisterStoreAddressService(storesRepository, addressRepository);
  });

  it('should be possible to register the store address.', async () => {
    const store = await makeStore(storesRepository)

    const result = await sut.execute(store.slug, {
      label: 'Home',
      state: 'SP',
      city: faker.location.city(),
      neighborhood: faker.location.postalAddress(),
      createdAt: new Date(),
    });

    expect(result.label).toEqual('Home');
  });

  it('should not be possible to register an address for a non-existent store.', async () => {
    await expect(() =>
      sut.execute('not store exists', {
        label: 'Home',
        state: 'SP',
        city: faker.location.city(),
        neighborhood: faker.location.postalAddress(),
        createdAt: new Date(),
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
