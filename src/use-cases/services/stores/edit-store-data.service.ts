import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  InputEditDataStoreDto,
  OutputEditDataStoreDto,
} from './dtos/edit-data-store.dto';
import { StoresRepository } from '@/database/repositories/stores-repository';
import { SlugGeneratorService } from './utils/generate-slug.service';

@Injectable()
export class EditStoreDataService {
  constructor(
    private storesRepository: StoresRepository,
    private slugGenerator: SlugGeneratorService,
  ) {}

  async execute(
    slug: string,
    data: InputEditDataStoreDto,
  ): Promise<OutputEditDataStoreDto> {
    const store = await this.storesRepository.findBySlug(slug);

    if (!store) {
      throw new NotFoundException(
        'The requested resource could not be processed.',
      );
    }

    let updatedSlug = store.slug;
    if (data.newName && data.newName != store.name) {
      updatedSlug = await this.slugGenerator.execute(data.newName, store.id);
    }

    if (data.newEmail && data.newEmail != store.email) {
      const isEmailDuplicate = await this.storesRepository.findBySLugAndEmail(
        slug,
        data.newEmail,
      );

      if (isEmailDuplicate) {
        throw new ConflictException(
          'Unable to complete the requested operation.',
        );
      }
    }

    const newStoreData = await this.storesRepository.save({
      id: store.id,
      name: data.newName ?? store.name,
      email: data.newEmail ?? store.email,
      slug: updatedSlug,
      description: data.newDescription ?? store.description,
      whatsapp: store.whatsapp,
      cnpj: store.cnpj,
      cpf: store.cpf,
      status: store.status,
      logo_image_url: store.logo_image_url,
      storage_public_id: store.storage_public_id,
    });

    return {
      name: newStoreData.name,
      slug: newStoreData.slug,
      email: newStoreData.email,
      description: newStoreData.description,
    };
  }
}
