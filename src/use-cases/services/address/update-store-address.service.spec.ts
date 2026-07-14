import { beforeEach, describe, expect, it } from 'vitest';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { AddressInMemoryRepository } from '../../../../test/in-memory-repository/addresses-in-memory-repository';
import { UpdateStoreAddressService } from './update-store-address.service';
import { StoresInMemoryRepository } from '../../../../test/in-memory-repository/stores-in-memory-repository';
import { makeStore } from '../../../../test/factories/make-store';
import { makeStoreAddress } from '../../../../test/factories/make-store-address';

let storesRepository: StoresInMemoryRepository;
let addressRepository: AddressInMemoryRepository;
let sut: UpdateStoreAddressService;

describe('Update User Address Service', () => {
  beforeEach(() => {
    storesRepository = new StoresInMemoryRepository();
    addressRepository = new AddressInMemoryRepository()
    sut = new UpdateStoreAddressService(storesRepository, addressRepository);
  });

  it('should be possible to update store address.', async () => {
    const store = await makeStore(storesRepository)

    const address = await makeStoreAddress(addressRepository, store.id)

    const newUserAddress = await sut.execute(store.slug, {
      city: 'Miami',
      neighborhood: 'Long Beach'
    });

    expect(newUserAddress.city).not.toEqual(address.city)
    expect(newUserAddress.neighborhood).not.toEqual(address.neighborhood)
  });

  it('should not be possible to edit the address of a non-existent store..', async () => {
    await expect(() =>
      sut.execute('not exists',{
        city: 'New York'
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException)
  });

  it('should not be possible to edit a non-existent address.', async () => {
    const store = await makeStore(storesRepository)

    await expect(() =>
      sut.execute(store.slug, {
        city: 'New York'
      }),
    ).rejects.toBeInstanceOf(ConflictException)
  });
});
