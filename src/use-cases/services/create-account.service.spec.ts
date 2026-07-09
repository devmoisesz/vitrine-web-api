import { beforeEach, describe, expect, it } from 'vitest';
import { UsersInMemoryRepository } from '../../../test/in-memory-repository/users-in-memory-repository';
import { CreateAccountService } from './create-account.service';
import { compare } from 'bcryptjs';
import { ConflictException } from '@nestjs/common';

let usersRepository: UsersInMemoryRepository;
let createAccountService: CreateAccountService;

describe('Create Account Service', () => {
  beforeEach(() => {
    usersRepository = new UsersInMemoryRepository();
    createAccountService = new CreateAccountService(usersRepository);
  });

  it('it should be able to create a user.', async () => {
    const user = await createAccountService.execute({
      name: 'John Doe',
      email: 'johndoe@example.com',
      password: '123456',
    });

    expect(user.id).toEqual(expect.any(String));
  });

  it('should not be able to register with same email twice.', async () => {
    const email = 'johndoe@example.com';

    await createAccountService.execute({
      name: 'John Doe',
      email,
      password: '123456',
    });

    await expect(() =>
      createAccountService.execute({
        name: 'John Doe',
        email,
        password: '123456',
      }),
    ).rejects.toBeInstanceOf(ConflictException)
  });

  it('Check if the password was encrypted correctly.', async () => {
    const user = await createAccountService.execute({
      name: 'John Doe',
      email: 'johndoe@example.com',
      password: '123456',
    });

    const isPasswordCorrectlyHashed = await compare('123456', user.password);

    expect(isPasswordCorrectlyHashed).toBe(true);
  });
});
