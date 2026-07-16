import { beforeEach, describe, expect, it } from 'vitest';
import { UsersInMemoryRepository } from '../../../../test/in-memory-repository/users-in-memory-repository';
import { NotFoundException } from '@nestjs/common';
import { ListEmployeeService } from './list-employee.service';
import { CollaboratorsInMemoryRepository } from '../../../../test/in-memory-repository/collaborators-in-memory-repository';
import { StoresInMemoryRepository } from '../../../../test/in-memory-repository/stores-in-memory-repository';
import { makeStore } from '../../../../test/factories/make-store';
import { makeUser } from '../../../../test/factories/make-user';

let usersRepository: UsersInMemoryRepository;
let collaboratorsRepository: CollaboratorsInMemoryRepository
let storesRepository: StoresInMemoryRepository;
let sut: ListEmployeeService;

describe('List Employee Service', () => {
  beforeEach(() => {
    collaboratorsRepository = new CollaboratorsInMemoryRepository();
    usersRepository = new UsersInMemoryRepository(collaboratorsRepository);
    storesRepository = new StoresInMemoryRepository();
    sut = new ListEmployeeService(
      usersRepository,
      storesRepository,
    );
  });

  it('must return all employees registered at the store.', async () => {
    const store = await makeStore(storesRepository)

    const user1 = await makeUser(usersRepository)
    const user2 = await makeUser(usersRepository)
    const user3 = await makeUser(usersRepository)

    await collaboratorsRepository.create({
        userId: user1.id,
        storeId: store.id,
        role: 'FUNCIONARIO'
    }),

    await collaboratorsRepository.create({
        userId: user2.id,
        storeId: store.id,
        role: 'FUNCIONARIO'
    }),

    await collaboratorsRepository.create({
        userId: user3.id,
        storeId: store.id,
        role: 'FUNCIONARIO'
    })

    const page = 1

    const result = await sut.execute(store.slug, page);

    expect(result).toHaveLength(3)
  });

  it('should return employees from page 2.', async () => {
    const store = await makeStore(storesRepository)

    const user1 = await makeUser(usersRepository)
    const user2 = await makeUser(usersRepository)
    const user3 = await makeUser(usersRepository)
    const user4 = await makeUser(usersRepository)
    const user5 = await makeUser(usersRepository)
    const user6 = await makeUser(usersRepository)

    await collaboratorsRepository.create({
        userId: user1.id,
        storeId: store.id,
        role: 'FUNCIONARIO'
    }),

    await collaboratorsRepository.create({
        userId: user2.id,
        storeId: store.id,
        role: 'FUNCIONARIO'
    }),

    await collaboratorsRepository.create({
        userId: user3.id,
        storeId: store.id,
        role: 'FUNCIONARIO'
    }),

    await collaboratorsRepository.create({
        userId: user4.id,
        storeId: store.id,
        role: 'FUNCIONARIO'
    }),

    await collaboratorsRepository.create({
        userId: user5.id,
        storeId: store.id,
        role: 'FUNCIONARIO'
    }),

    await collaboratorsRepository.create({
        userId: user6.id,
        storeId: store.id,
        role: 'FUNCIONARIO'
    })

    const page = 2

    const result = await sut.execute(store.slug, page);

    expect(result).toHaveLength(1)
  });

  it('Only the employees should return.', async () => {
    const store = await makeStore(storesRepository)

    const user1 = await makeUser(usersRepository)
    const user2 = await makeUser(usersRepository)
    const user3 = await makeUser(usersRepository)

    await collaboratorsRepository.create({
        userId: user1.id,
        storeId: store.id,
        role: 'FUNCIONARIO'
    }),

    await collaboratorsRepository.create({
        userId: user2.id,
        storeId: store.id,
        role: 'PROPRIETARIO'
    }),

    await collaboratorsRepository.create({
        userId: user3.id,
        storeId: store.id,
        role: 'PROPRIETARIO'
    })

    const page = 1

    const result = await sut.execute(store.slug, page);

    expect(result).toHaveLength(1)
  });

  it('should return an empty array because there are no registered employees..', async () => {
    const store = await makeStore(storesRepository)

    const user = await makeUser(usersRepository)

    await collaboratorsRepository.create({
        userId: user.id,
        storeId: store.id,
        role: 'PROPRIETARIO'
    })

    const page = 1

    const result = await sut.execute(store.slug, page);

    expect(result).toHaveLength(0)
  });

  it('should return an unauthorized error because the store does not.', async () => {
    const page = 3

    await expect(() =>
      sut.execute('not exists', page),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
