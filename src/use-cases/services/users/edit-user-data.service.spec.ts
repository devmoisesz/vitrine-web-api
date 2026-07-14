import { beforeEach, describe, expect, it } from 'vitest';
import { UsersInMemoryRepository } from '../../../../test/in-memory-repository/users-in-memory-repository';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { EditUserDataService } from './edit-user-data.service';
import { makeUser } from '../../../../test/factories/make-user';

let usersRepository: UsersInMemoryRepository;
let sut: EditUserDataService;

describe('Create Account Service', () => {
  beforeEach(() => {
    usersRepository = new UsersInMemoryRepository();
    sut = new EditUserDataService(usersRepository);
  });

  it('should be possible to update user data.', async () => {
    const user = await makeUser(usersRepository)

    const newUserData = await sut.execute(user.id,{
      name: 'John Doe',
      email: 'johndoe@example.com',
    });

    expect(newUserData.name).not.toEqual(user.name)
    expect(newUserData.email).not.toEqual(user.email)
  });

  it('should be possible to update only the username.', async () => {
    const user = await makeUser(usersRepository)

    const newUserData = await sut.execute(user.id,{
      name: 'John Doe',
    });

    expect(newUserData.name).not.toEqual(user.name)
  });

  it('should be possible to update only the user email.', async () => {
    const user = await makeUser(usersRepository)

    const newUserData = await sut.execute(user.id,{
      email: 'johndoe@example.com',
    });

    expect(newUserData.email).not.toEqual(user.email)
  });

  it('should not be possible to edit an existing email.', async () => {
    const user1 = await makeUser(usersRepository)
    const user2 = await makeUser(usersRepository)

    await expect(() =>
      sut.execute(user2.id,{
        name: 'John Doe',
        email: user1.email,
      }),
    ).rejects.toBeInstanceOf(ConflictException)
  });

  it('should not be possible to edit data for a non-existent user.', async () => {
    await expect(() =>
      sut.execute('not exists',{
        name: 'John Doe',
        email: 'johndoe@example.com',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException)
  });
});
