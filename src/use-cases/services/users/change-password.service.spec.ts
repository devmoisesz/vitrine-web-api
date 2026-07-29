import { beforeEach, describe, expect, it } from 'vitest';
import { UsersInMemoryRepository } from '../../../../test/in-memory-repository/users-in-memory-repository';
import { compare, hash } from 'bcryptjs';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { ChangePasswordService } from './change-password.service';

let usersRepository: UsersInMemoryRepository;
let sut: ChangePasswordService;

describe('Change Password Service', () => {
  beforeEach(() => {
    usersRepository = new UsersInMemoryRepository();
    sut = new ChangePasswordService(usersRepository);
  });

  it('should be possible to change the password.', async () => {
    const user = await usersRepository.create({
      name: 'John Doe',
      email: 'johndoe@example.com',
      password: await hash('123456', 8),
    });

    await sut.execute(user.id, {
      currentPassword: '123456',
      newPassword: '654321'
    });

    const userNewPassword = await usersRepository.items.find((item) => item.id === user.id)

    const result = await compare('654321', userNewPassword?.password!)

    expect(result).toBeTruthy()
  });

  it('should not be possible to change the password of a user logged in via Google.', async () => {
    const user = await usersRepository.create({
      name: 'John Doe',
      email: 'johndoe@example.com',
      password: await hash('123456', 8),
      provider: 'GOOGLE'
    });

    await expect(() =>
      sut.execute(user.id, {
        currentPassword: '123456',
        newPassword: '6555555'
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('should not be possible to change the password by submitting an incorrect current password.', async () => {
    const user = await usersRepository.create({
      name: 'John Doe',
      email: 'johndoe@example.com',
      password: await hash('123456', 8),
    });

    await expect(() =>
      sut.execute(user.id, {
        currentPassword: '555555',
        newPassword: '6555555'
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
