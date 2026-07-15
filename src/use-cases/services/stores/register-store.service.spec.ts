import { beforeEach, describe, expect, it } from 'vitest';
import { UsersInMemoryRepository } from '../../../../test/in-memory-repository/users-in-memory-repository';
import { CollaboratorsInMemoryRepository } from '../../../../test/in-memory-repository/collaborators-in-memory-repository';
import { StoresInMemoryRepository } from '../../../../test/in-memory-repository/stores-in-memory-repository';
import { makeStore } from '../../../../test/factories/make-store';
import { makeUser } from '../../../../test/factories/make-user';
import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { RegisterStoreService } from './register-store.service';
import { faker } from '@faker-js/faker';
import { makeEmail } from '../../../../test/factories/make-email';
import { SlugGeneratorService } from '@/use-cases/utils/generate-slug.service';

let usersRepository: UsersInMemoryRepository;
let collaboratorsRepository: CollaboratorsInMemoryRepository;
let storesRepository: StoresInMemoryRepository;
let slugGenerator:SlugGeneratorService
let sut: RegisterStoreService;

describe('Register Collaborator Service', () => {
  beforeEach(() => {
    usersRepository = new UsersInMemoryRepository();
    storesRepository = new StoresInMemoryRepository();
    collaboratorsRepository = new CollaboratorsInMemoryRepository();
    slugGenerator = new SlugGeneratorService(storesRepository)
    sut = new RegisterStoreService(
      collaboratorsRepository,
      usersRepository,
      storesRepository,
      slugGenerator
    );
  });

  it('should be possible to register a store.', async () => {
    const user = await makeUser(usersRepository)

    const result = await sut.execute({
      store_name: faker.internet.domainName(),
      owner_email: user.email,
      whatsapp: '1699423456',
    });

    expect(result.store.id).toEqual(expect.any(String));
    expect(result.owner.role).toEqual('Proprietário');
    expect(storesRepository.items[0]).toEqual(result.store);
    expect(collaboratorsRepository.items[0]).toEqual(result.owner);
  });

  it('should not be possible to register an existing store.', async () => {
    const uniqueEmail = makeEmail();
    const store = await makeStore(storesRepository);

    await expect(() =>
      sut.execute({
        store_name: store.name,
        owner_email: uniqueEmail,
        whatsapp: store.whatsapp,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('should not be possible to register an owner who has not yet been registered in the users database.', async () => {
    const uniqueEmail = makeEmail();
    const store = await makeStore(storesRepository);

    await expect(() =>
      sut.execute({
        store_name: store.name,
        owner_email: uniqueEmail,
        whatsapp: store.whatsapp,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('should not be possible to register an owner who is already an employee of a store.', async () => {
    const user = await makeUser(usersRepository)

    const store = await makeStore(storesRepository);

    await collaboratorsRepository.create({
      userId: user.id,
      storeId: store.id
    })

    await expect(() =>
      sut.execute({
        store_name: 'store',
        owner_email: user.email,
        whatsapp: faker.phone.imei(),
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
});
