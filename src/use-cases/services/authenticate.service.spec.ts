import { beforeEach, describe, expect, it } from 'vitest';
import { UsersInMemoryRepository } from '../../../test/in-memory-repository/users-in-memory-repository';
import { CreateAccountService } from './create-account.service';
import { compare, hash } from 'bcryptjs';
import { BadRequestException, ConflictException } from '@nestjs/common';
import { AuthenticateService } from './authenticate.service';

let usersRepository: UsersInMemoryRepository;
let authenticateService: AuthenticateService;

describe('Authenticate Service', () => {
  beforeEach(() => {
    usersRepository = new UsersInMemoryRepository();
    authenticateService = new AuthenticateService(usersRepository);
  });

  it('must be possible to authenticate the user.', async () => {
    await usersRepository.create({
      name: 'John Doe',
      email: 'johndoe@example.com',
      password: await hash('123456', 8),
    });

    const user = await authenticateService.execute({
      email: 'johndoe@example.com',
      password: '123456',
    });

    expect(user.id).toEqual(expect.any(String));
  });

  it('should not be able to authenticate with wrong email', async () => {
    await expect(() =>
      authenticateService.execute({
        email: 'johndoe@example.com',
        password: '123456',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('should not be able to authenticate with wrong password', async () => {
    await usersRepository.create({
      name: 'John Doe',
      email: 'johndoe@example.com',
      password: await hash('123456', 6),
    });

    await expect(() =>
      authenticateService.execute({
        email: 'johndoe@example.com',
        password: '123456123',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
