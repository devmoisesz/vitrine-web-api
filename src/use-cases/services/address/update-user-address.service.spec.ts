import { beforeEach, describe, expect, it } from 'vitest';
import { UsersInMemoryRepository } from '../../../../test/in-memory-repository/users-in-memory-repository';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { makeUser } from '../../../../test/factories/make-user';
import { UpdateUserAddressService } from './update-user-address.service';
import { AddressInMemoryRepository } from '../../../../test/in-memory-repository/addresses-in-memory-repository';
import { makeUserAddress } from '../../../../test/factories/make-user-address';

let usersRepository: UsersInMemoryRepository;
let addressRepository: AddressInMemoryRepository;
let sut: UpdateUserAddressService;

describe('Update User Address Service', () => {
  beforeEach(() => {
    usersRepository = new UsersInMemoryRepository();
    addressRepository = new AddressInMemoryRepository()
    sut = new UpdateUserAddressService(usersRepository, addressRepository);
  });

  it('should be possible to update user address.', async () => {
    const user = await makeUser(usersRepository)

    const address = await makeUserAddress(addressRepository, user.id)

    const newUserAddress = await sut.execute(user.id, address.id, {
      city: 'Miami',
      neighborhood: 'Long Beach'
    });

    expect(newUserAddress.city).not.toEqual(address.city)
    expect(newUserAddress.neighborhood).not.toEqual(address.neighborhood)
  });

  it('should not be possible to edit the address of a non-existent user.', async () => {


    await expect(() =>
      sut.execute('not exists', 'not exists',{
        city: 'New York'
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException)
  });

  it('should not be possible to edit a non-existent address.', async () => {
    const user = await makeUser(usersRepository)

    await expect(() =>
      sut.execute(user.id, 'not exists',{
        city: 'New York'
      }),
    ).rejects.toBeInstanceOf(NotFoundException)
  });
});
