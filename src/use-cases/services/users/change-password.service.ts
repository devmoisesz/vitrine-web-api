import { UsersRepository } from '@/database/repositories/users-repository';
import {
    ConflictException,
    Injectable, UnauthorizedException
} from '@nestjs/common';
import { compare, hash } from 'bcryptjs';
import { ChangePasswordDto } from './dtos/change-password.dto';

@Injectable()
export class ChangePasswordService {
  constructor(private usersRepository: UsersRepository) {}

  async execute(userId: string, data: ChangePasswordDto) {
    const user = await this.usersRepository.findById(userId);

    if (!user) {
      throw new UnauthorizedException('Invalid authentication credentials.');
    }

    if (user.provider === 'GOOGLE') {
      throw new ConflictException(
        'Unable to complete the requested operation.',
      );
    }

    const isUserPassoword = await compare(data.currentPassword, user.password!);

    if (!isUserPassoword) {
      throw new UnauthorizedException('Invalid authentication credentials.');
    }

    const hashedPassword = await hash(data.newPassword, 8);

    await this.usersRepository.changePassword(userId, hashedPassword);
  }
}
