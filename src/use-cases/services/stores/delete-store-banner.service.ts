import { Injectable, NotFoundException } from '@nestjs/common';
import { StorageService } from '@/storage/storage.service';
import { StoresRepository } from '@/database/repositories/stores-repository';

@Injectable()
export class DeleteStoreBannerService {
  constructor(
    private storesRepository: StoresRepository,
    private storageService: StorageService,
  ) {}

  async execute(slug: string) {
    const store = await this.storesRepository.findBySlug(slug);

    if (!store) {
      throw new NotFoundException('Resource not found.');
    }

    if (!store.bannerPublicId) {
      throw new NotFoundException('Resource Not Found');
    }

    await this.storageService.delete(store.bannerPublicId);
    
    await this.storesRepository.save({
        ...store,
        bannerUrl: null,
        bannerPublicId: null
    })
  }
}
