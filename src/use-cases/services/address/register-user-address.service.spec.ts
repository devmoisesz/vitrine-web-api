import { beforeEach, describe, expect, it } from 'vitest';
import { UsersInMemoryRepository } from '../../../../test/in-memory-repository/users-in-memory-repository';
import { makeUser } from '../../../../test/factories/make-user';
import { UnauthorizedException } from '@nestjs/common';
import { faker } from '@faker-js/faker';
import { RegisterUserAddressService } from './register-user-address.service';
import { AddressInMemoryRepository } from '../../../../test/in-memory-repository/addresses-in-memory-repository';

let usersRepository: UsersInMemoryRepository;
let addressRepository: AddressInMemoryRepository;
let sut: RegisterUserAddressService;

describe('Register User Address Service', () => {
  beforeEach(() => {
    usersRepository = new UsersInMemoryRepository();
    addressRepository = new AddressInMemoryRepository();
    sut = new RegisterUserAddressService(usersRepository, addressRepository);
  });

  it('should be possible to register the user address.', async () => {
    const user = await makeUser(usersRepository);

    const result = await sut.execute(user.id, {
      label: 'Home',
      state: 'SP',
      city: faker.location.city(),
      neighborhood: faker.location.postalAddress(),
      createdAt: new Date(),
    });

    expect(result.label).toEqual('Home');
  });

  it('should not be possible to register an address for a non-existent user.', async () => {
    await expect(() =>
      sut.execute('1',{
        label: 'Home',
        state: 'SP',
        city: faker.location.city(),
        neighborhood: faker.location.postalAddress(),
        createdAt: new Date(),
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
