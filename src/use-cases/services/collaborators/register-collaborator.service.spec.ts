import { beforeEach, describe, expect, it } from 'vitest';
import { UsersInMemoryRepository } from '../../../../test/in-memory-repository/users-in-memory-repository';
import { RegisterCollaboratorService } from './register-collaborator.service';
import { CollaboratorsInMemoryRepository } from '../../../../test/in-memory-repository/collaborators-in-memory-repository';
import { hash } from 'bcryptjs';
import { StoresInMemoryRepository } from '../../../../test/in-memory-repository/stores-in-memory-repository';
import { makeStore } from '../../../../test/factories/make-store';
import { makeUser } from '../../../../test/factories/make-user';
import { BadRequestException } from '@nestjs/common';

let usersRepository: UsersInMemoryRepository;
let collaboratorsRepository: CollaboratorsInMemoryRepository;
let storesRepository: StoresInMemoryRepository
let sut: RegisterCollaboratorService;

describe('Register Collaborator Service', () => {
  beforeEach(() => {
    usersRepository = new UsersInMemoryRepository();
    storesRepository = new StoresInMemoryRepository()
    collaboratorsRepository = new CollaboratorsInMemoryRepository();
    sut = new RegisterCollaboratorService(
      collaboratorsRepository,
      usersRepository,
    );
  });

  it('should be possible to register a collaborator.', async () => {
    const result = await sut.execute('1', {
      name: 'John doe',
      email: 'johndoe@example.com',
      password: '123456',
    });

    expect(result.id).toEqual(expect.any(String));
    expect(collaboratorsRepository.items[0]).toEqual(result);
  });

  it('should not be possible to register an employee who is already linked to a store.', async () => {
    const store = await makeStore(storesRepository)

    const user = await makeUser(usersRepository)

    await collaboratorsRepository.create({
      userId: user.id,
      storeId: store.id
    })

    await expect(() => sut.execute(store.id, {
      name: user.name,
      email: user.email,
      password: user.password!,
    })).rejects.toBeInstanceOf(BadRequestException)
  });

  it('should be possible to register an employee even when submitting a user who is already registered.', async () => {
    const user = await usersRepository.create({
      name: 'John doe',
      email: 'johndoe@example.com',
      password: await hash('123456', 8),
    });

    const result = await sut.execute('1', {
      name: 'John doe',
      email: user.email,
      password: '123456',
    });

    expect(result.id).toEqual(expect.any(String));
    expect(collaboratorsRepository.items[0]).toEqual(result);
    expect(usersRepository.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: user.id,
        }),
      ]),
    );
    expect(collaboratorsRepository.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          userId: user.id,
        }),
      ]),
    );
  });
});
