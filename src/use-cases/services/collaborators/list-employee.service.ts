import {
  Injectable,
  UnauthorizedException
} from '@nestjs/common';
import { UsersRepository } from '../../../database/repositories/users-repository';
import { Address, Collaborator } from '@prisma/client';
import { CollaboratorsRepository } from '@/database/repositories/collaborators-repository';

@Injectable()
export class ListEmployeeService {
  constructor(
    private usersRepository: UsersRepository,
    private collaboratorsRepository: CollaboratorsRepository,
  ) {}

  async execute(storeId: string): Promise<Collaborator[]> {
    const user = await this.usersRepository.findById(userId);

    if (!user) {
      throw new UnauthorizedException('Authentication required.');
    }

    return await this.addressRepository.findManyByUserId(user.id, page)
  }
}
