import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { UsersRepository } from '@/database/repositories/users-repository';
import { CollaboratorsRepository } from '@/database/repositories/collaborators-repository';
import { InputRegisterStroreDto } from './dtos/register-store.dto';
import { StoresRepository } from '@/database/repositories/stores-repository';
import { SlugGeneratorService } from './utils/generate-slug.service';

@Injectable()
export class RegisterStoreService {
  constructor(
    private collaboratorsRepository: CollaboratorsRepository,
    private usersRepository: UsersRepository,
    private storesRepository: StoresRepository,
    private slugGenerator: SlugGeneratorService,
  ) {}

  async execute(data: InputRegisterStroreDto) {
    const existingStore = await this.storesRepository.findByWhatsapp(
      data.whatsapp,
    );

    if (existingStore) {
      throw new BadRequestException(
        'Unable to complete the requested operation.',
      );
    }

    const user = await this.usersRepository.findByEmail(data.owner_email);

    if (!user) {
      throw new BadRequestException('Unable to process the request.');
    }

    const isCollaborator = await this.collaboratorsRepository.findByUserId(
      user.id,
    );

    if (isCollaborator) {
      throw new ForbiddenException(
        'You do not have permission to perform this action.',
      );
    }

    const slug = await this.slugGenerator.execute(data.store_name);

    const store = await this.storesRepository.create({
      name: data.store_name,
      email: data.store_email,
      slug,
      whatsapp: data.whatsapp,
    });

    const owner = await this.collaboratorsRepository.create({
      storeId: store.id,
      userId: user.id,
      role: 'Proprietário',
    });

    return {
      store,
      owner,
    };
  }
}
