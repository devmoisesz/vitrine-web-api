import { beforeEach, describe, expect, it, vi } from 'vitest';
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
    addressRepository = new AddressInMemoryRepository();
    sut = new UpdateUserAddressService(usersRepository, addressRepository);
  });

  it('should be possible to update user address.', async () => {
    const user = await makeUser(usersRepository);

    const address = await makeUserAddress(addressRepository, user.id);

    const newUserAddress = await sut.execute(user.id, address.id, {
      city: 'Miami',
      neighborhood: 'Long Beach',
    });

    expect(newUserAddress.city).not.toEqual(address.city);
    expect(newUserAddress.neighborhood).not.toEqual(address.neighborhood);
  });

  it('should not be possible to edit the address of a non-existent user.', async () => {
    await expect(() =>
      sut.execute('not exists', 'not exists', {
        city: 'New York',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('should not be possible to edit a non-existent address.', async () => {
    const user = await makeUser(usersRepository);

    await expect(() =>
      sut.execute(user.id, 'not exists', {
        city: 'New York',
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('rejects another user address without changing it', async () => {
    const userA = await makeUser(usersRepository);
    const userB = await makeUser(usersRepository);
    const address = await makeUserAddress(addressRepository, userB.id);
    const before = JSON.stringify(addressRepository.items);

    await expect(
      sut.execute(userA.id, address.id, { city: 'Changed' }),
    ).rejects.toBeInstanceOf(NotFoundException);

    expect(JSON.stringify(addressRepository.items)).toBe(before);
  });

  it.each([false, true])(
    'rejects store addresses, including ones linked to the user: %s',
    async (linkedToUser) => {
      const user = await makeUser(usersRepository);
      const address = await addressRepository.create({
        userId: linkedToUser ? user.id : null,
        storeId: 'store-a',
        state: 'SP',
        city: 'São Paulo',
        neighborhood: 'Centro',
      });
      const before = JSON.stringify(addressRepository.items);

      await expect(
        sut.execute(user.id, address.id, { city: 'Changed' }),
      ).rejects.toBeInstanceOf(NotFoundException);

      expect(JSON.stringify(addressRepository.items)).toBe(before);
    },
  );

  it('does not claim an address with no owner', async () => {
    const user = await makeUser(usersRepository);
    const address = await addressRepository.create({
      state: 'SP',
      city: 'São Paulo',
      neighborhood: 'Centro',
    });
    const before = JSON.stringify(addressRepository.items);

    await expect(
      sut.execute(user.id, address.id, { city: 'Changed' }),
    ).rejects.toBeInstanceOf(NotFoundException);

    expect(JSON.stringify(addressRepository.items)).toBe(before);
  });

  it.each([undefined, null, '', '   ', 123])(
    'rejects invalid authenticated identity %j before querying users',
    async (userId) => {
      const findUser = vi.spyOn(usersRepository, 'findById');

      await expect(
        sut.execute(userId as string, 'address-a', { city: 'Changed' }),
      ).rejects.toBeInstanceOf(UnauthorizedException);

      expect(findUser).not.toHaveBeenCalled();
    },
  );

  it.each(['another-user', 'store', 'deleted'])(
    'rechecks ownership at write time after address becomes %s',
    async (change) => {
      const user = await makeUser(usersRepository);
      const address = await makeUserAddress(addressRepository, user.id);
      const originalCity = address.city;
      const readAddress = { ...address };
      vi.spyOn(addressRepository, 'findByIdAndUserId').mockImplementationOnce(
        async () => {
          if (change === 'another-user') address.userId = 'other-user';
          if (change === 'store') address.storeId = 'store-a';
          if (change === 'deleted') addressRepository.items = [];
          return readAddress;
        },
      );

      await expect(
        sut.execute(user.id, address.id, { city: 'Changed' }),
      ).rejects.toBeInstanceOf(NotFoundException);

      expect(address.city).toBe(originalCity);
      if (change === 'deleted') expect(addressRepository.items).toEqual([]);
    },
  );
});
