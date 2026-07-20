import { beforeEach, describe, expect, it } from 'vitest';
import { NotFoundException } from '@nestjs/common';
import { StoresInMemoryRepository } from '../../../../test/in-memory-repository/stores-in-memory-repository';
import { GetStoreProfileService } from './get-store-profile.service';
import { AddressInMemoryRepository } from '../../../../test/in-memory-repository/addresses-in-memory-repository';
import { makeStoreAddress } from '../../../../test/factories/make-store-address';
import { randomUUID } from 'node:crypto';
import { faker } from '@faker-js/faker';
import { makeEmail } from '../../../../test/factories/make-email';

let storesRepository: StoresInMemoryRepository;
let addressRepository: AddressInMemoryRepository;
let sut: GetStoreProfileService;

describe('Get Store Profile Service', () => {
  beforeEach(() => {
    storesRepository = new StoresInMemoryRepository();
    addressRepository = new AddressInMemoryRepository();
    sut = new GetStoreProfileService(storesRepository, addressRepository);
  });

  it('should be possible to list store profile.', async () => {
    const store = await storesRepository.create({
        id: randomUUID(),
        name: faker.person.fullName(),
        slug: 'slug-test',
        email: makeEmail(),
        description: faker.lorem.text(),
        whatsapp: faker.phone.imei(),
        logo_image_url: 'www.image.com',
        storage_public_id: randomUUID()
    })

    const address = await makeStoreAddress(addressRepository, store.id)

    const result = await sut.execute(store.slug)
    
    expect(result.name).toEqual(store.name)
    expect(result.logo_url).toEqual(store.logo_image_url)
    expect(result.address).toEqual(address)
  });

  it('should be possible to list a non-existent store.', async () => {
    await expect(() =>
      sut.execute('not exists'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
