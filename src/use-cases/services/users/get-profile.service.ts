import {
    ForbiddenException,
    Injectable,
    UnauthorizedException
} from '@nestjs/common';
import { UsersRepository } from '../../../database/repositories/users-repository';
import {
    InputGetProfileDto,
    OutputGetProfileDto,
} from './dtos/get-profile.dto';
import { CollaboratorsRepository } from '@/database/repositories/collaborators-repository';
import { AddresssRepository } from '@/database/repositories/addresses-repository';
import { StoresRepository } from '@/database/repositories/stores-repository';

@Injectable()
export class GetProfileService {
  constructor(
    private usersRepositoy: UsersRepository,
    private collaboratorsRepository: CollaboratorsRepository,
    private addressRepository: AddresssRepository,
    private storesRepository: StoresRepository,
  ) {}

  async execute(data: InputGetProfileDto): Promise<OutputGetProfileDto> {
    const user = await this.usersRepositoy.findById(data.userId);

    if (!user) {
      throw new UnauthorizedException('Authentication required.');
    }

    const userAddress = await this.addressRepository.findByUserId(user.id)

    const isCollaborator = await this.collaboratorsRepository.findByUserId(
      user.id,
    );

    if (isCollaborator) {
      const store = await this.storesRepository.findById(
        isCollaborator?.storeId,
      );

      if(!store){
        throw new ForbiddenException('Account configuration error.')
      }

      const storeAddress = await this.addressRepository.findByStoreId(store.id)

      return {
        user_name: user.name,
        user_email: user.email,
        user_role: isCollaborator.role,
        store_name: store?.name,
        store_address: storeAddress ?? undefined,
        user_address: userAddress ?? null
      };
    }

    return {
        user_name: user.name,
        user_email: user.email,
        user_role: user.role === 'Usuário' ? "Cliente" : 'Admin',
        user_address: userAddress ?? null
    }
  }
}
