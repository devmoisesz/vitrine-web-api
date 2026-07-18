import { Injectable, NotFoundException } from '@nestjs/common';
import { StorageService } from '@/storage/storage.service';
import { StoresRepository } from '@/database/repositories/stores-repository';

@Injectable()
export class DeleteStoreLogoService {
  constructor(
    private storesRepository: StoresRepository,
    private storageService: StorageService,
  ) {}

  async execute(slug: string) {
    const store = await this.storesRepository.findBySlug(slug);

    if (!store) {
      throw new NotFoundException('Resource not found.');
    }

    if (!store.storage_public_id) {
      throw new NotFoundException('Resource Not Found');
    }

    await this.storageService.delete(store.storage_public_id);
    
    await this.storesRepository.save({
        ...store,
        logo_image_url: null,
        storage_public_id: null
    })
  }
}
