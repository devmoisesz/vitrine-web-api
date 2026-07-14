import { beforeEach, describe, expect, it } from 'vitest';
import { UsersInMemoryRepository } from '../../../../test/in-memory-repository/users-in-memory-repository';
import { hash } from 'bcryptjs';
import { UnauthorizedException } from '@nestjs/common';
import { AddressInMemoryRepository } from '../../../../test/in-memory-repository/addresses-in-memory-repository';
import { makeEmail } from '../../../../test/factories/make-email';
import { ListUserAddressesService } from './list-user-addresses.service';
import { makeUserAddress } from '../../../../test/factories/make-user-address';

let usersRepository: UsersInMemoryRepository;
let addressRepository: AddressInMemoryRepository;
let sut: ListUserAddressesService;

const uniqueEmail = makeEmail()

describe('List User Addresses Service', () => {
  beforeEach(() => {
    usersRepository = new UsersInMemoryRepository();
    addressRepository = new AddressInMemoryRepository();
    sut = new ListUserAddressesService(
      usersRepository,
      addressRepository,
    );
  });

  it('must return all addresses registered by the user.', async () => {
    const user = await usersRepository.create({
      name: 'John Doe',
      email: uniqueEmail,
      password: await hash('123456', 8),
    });

    await makeUserAddress(addressRepository, user.id)
    await makeUserAddress(addressRepository, user.id)
    await makeUserAddress(addressRepository, user.id)

    const page = 1

    const result = await sut.execute(user.id, page);

    expect(result).toHaveLength(3)
  });

  it('should return addresses from page 2.', async () => {
    const user = await usersRepository.create({
      name: 'John Doe',
      email: uniqueEmail,
      password: await hash('123456', 8),
    });

    await makeUserAddress(addressRepository, user.id)
    await makeUserAddress(addressRepository, user.id)
    await makeUserAddress(addressRepository, user.id)
    await makeUserAddress(addressRepository, user.id)
    await makeUserAddress(addressRepository, user.id)
    await makeUserAddress(addressRepository, user.id)

    const page = 2

    const result = await sut.execute(user.id, page);

    expect(result).toHaveLength(1)
  });

  it('should return an empty array because the user does not have a registered address', async () => {
    const user = await usersRepository.create({
      name: 'John Doe',
      email: uniqueEmail,
      password: await hash('123456', 8),
    });

    const page = 1

    const result = await sut.execute(user.id, page);

    expect(result).toHaveLength(0)
  });

  it('should return an Unauthorized error because the user does not exist.', async () => {

    const page = 3
    const userId = '1'

    await expect(() =>
      sut.execute(userId, page),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
