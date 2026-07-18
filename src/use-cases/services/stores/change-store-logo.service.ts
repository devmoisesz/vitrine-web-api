import { Injectable, NotFoundException } from '@nestjs/common';
import { StorageService } from '@/storage/storage.service';
import { StoresRepository } from '@/database/repositories/stores-repository';

@Injectable()
export class ChangeStoreLogoService {
  constructor(
    private storesRepository: StoresRepository,
    private storageService: StorageService,
  ) {}

  async execute(slug: string, file: Express.Multer.File) {
    const store = await this.storesRepository.findBySlug(slug);

    if (!store) {
      throw new NotFoundException('Resource not found.');
    }

    if (!store.storage_public_id) {
      throw new NotFoundException('Resource Not Found');
    }

    await this.storageService.delete(store.storage_public_id);

    const newLogo = await this.storageService.upload({
      body: file.buffer,
      fileName: file.originalname,
      contentType: file.mimetype,
      folder: `vitrine-web/${slug}/logos`,
    });

    await this.storesRepository.saveImage(
      store.id,
      newLogo.url,
      newLogo.public_id,
    );
  }
}
