import { beforeEach, describe, expect, it } from 'vitest';
import { UsersInMemoryRepository } from '../../../../test/in-memory-repository/users-in-memory-repository';
import { hash } from 'bcryptjs';
import { UnauthorizedException } from '@nestjs/common';
import { GetProfileService } from './get-profile.service';
import { CollaboratorsInMemoryRepository } from '../../../../test/in-memory-repository/collaborators-in-memory-repository';
import { StoresInMemoryRepository } from '../../../../test/in-memory-repository/stores-in-memory-repository';
import { AddressInMemoryRepository } from '../../../../test/in-memory-repository/addresses-in-memory-repository';
import { makeEmail } from '../../../../test/factories/make-email';
import { makeStore } from '../../../../test/factories/make-store';

let usersRepository: UsersInMemoryRepository;
let collaboratorsRepository: CollaboratorsInMemoryRepository;
let storesRepository: StoresInMemoryRepository;
let addressRepository: AddressInMemoryRepository;
let sut: GetProfileService;

const uniqueEmail = makeEmail()

describe('Get Profile Service', () => {
  beforeEach(() => {
    usersRepository = new UsersInMemoryRepository();
    collaboratorsRepository = new CollaboratorsInMemoryRepository();
    storesRepository = new StoresInMemoryRepository();
    addressRepository = new AddressInMemoryRepository();
    sut = new GetProfileService(
      usersRepository,
      collaboratorsRepository,
      addressRepository,
      storesRepository,
    );
  });

  it('should return user data.', async () => {
    const user = await usersRepository.create({
      name: 'John Doe',
      email: uniqueEmail,
      password: await hash('123456', 8),
      role: 'USER'
    });

    const result = await sut.execute({
      userId: user.id,
    });

    expect(result.user_role).toEqual('Cliente');
    expect(result.user_address).toBeNull
  });

  it('should return admin data.', async () => {
    const user = await usersRepository.create({
      name: 'John Doe',
      email: uniqueEmail,
      password: await hash('123456', 8),
      role: 'ADMIN'
    });

    const result = await sut.execute({
      userId: user.id,
    });

    expect(result.user_role).toEqual('Admin');
  });

  it('should return collaborator data.', async () => {
    const user = await usersRepository.create({
      name: 'John Doe',
      email: uniqueEmail,
      password: await hash('123456', 8),
    });

    const store = await makeStore(storesRepository)

    await collaboratorsRepository.create({
        userId: user.id,
        storeId: store.id,
        role: 'PROPRIETARIO'
    })

    const result = await sut.execute({
      userId: user.id,
    });

    expect(result.user_role).toEqual('Proprietário');
    expect(result.store_name).toEqual(store.name)
  });

  it('must not allow searching for a non-existent user', async () => {
    await expect(() =>
      sut.execute({
        userId: '1',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
