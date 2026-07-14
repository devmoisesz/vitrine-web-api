import {
  Injectable,
  UnauthorizedException
} from '@nestjs/common';
import { UsersRepository } from '../../../database/repositories/users-repository';
import { AddressRepository } from '@/database/repositories/addresses-repository';
import { Address } from '@prisma/client';

@Injectable()
export class ListUserAddressesService {
  constructor(
    private usersRepositoy: UsersRepository,
    private addressRepository: AddressRepository,
  ) {}

  async execute(userId: string, page: number): Promise<Address[]> {
    const user = await this.usersRepositoy.findById(userId);

    if (!user) {
      throw new UnauthorizedException('Authentication required.');
    }

    return await this.addressRepository.findManyByUserId(user.id, page)
  }
}
