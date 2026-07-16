import { beforeEach, describe, expect, it } from 'vitest';
import { UsersInMemoryRepository } from '../../../../test/in-memory-repository/users-in-memory-repository';
import { CollaboratorsInMemoryRepository } from '../../../../test/in-memory-repository/collaborators-in-memory-repository';
import { StoresInMemoryRepository } from '../../../../test/in-memory-repository/stores-in-memory-repository';
import { makeStore } from '../../../../test/factories/make-store';
import { makeUser } from '../../../../test/factories/make-user';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { DeleteEmployeeService } from './delete-employee.service';
import { makeCollaborator } from '../../../../test/factories/make-collaborator';

let collaboratorsRepository: CollaboratorsInMemoryRepository;
let usersRepository: UsersInMemoryRepository;
let storesRepository: StoresInMemoryRepository;
let sut: DeleteEmployeeService;

describe('Delete Employee Service', () => {
  beforeEach(() => {
    storesRepository = new StoresInMemoryRepository();
    usersRepository = new UsersInMemoryRepository();
    collaboratorsRepository = new CollaboratorsInMemoryRepository();
    sut = new DeleteEmployeeService(collaboratorsRepository, storesRepository);
  });

  it('should be possible to delete an employee.', async () => {
    const user = await makeUser(usersRepository);

    const store = await makeStore(storesRepository);

    const employee = await makeCollaborator(
      collaboratorsRepository,
      user.id,
      store.id,
      'FUNCIONARIO',
    );

    await sut.execute(store.slug, employee.id);

    expect(collaboratorsRepository.items).toHaveLength(0);
  });

  it('should not allow deleting an employee from a store that does not exist.', async () => {
    await expect(() =>
      sut.execute('not exits', 'not exist'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('should not allow the deletion of an employee who does not exist.', async () => {
    const store = await makeStore(storesRepository);

    await expect(() =>
      sut.execute(store.slug, 'not exist'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('should not allow deleting an owner.', async () => {
    const store = await makeStore(storesRepository);

    const user = await makeUser(usersRepository);

    const owner = await makeCollaborator(
      collaboratorsRepository,
      user.id,
      store.id,
      'PROPRIETARIO',
    );

    await expect(() =>
      sut.execute(store.slug, owner.id),
    ).rejects.toBeInstanceOf(ConflictException);
  });
});
