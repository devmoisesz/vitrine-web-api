import { Injectable, NotFoundException } from '@nestjs/common';
import { StorageService } from '@/storage/storage.service';
import { replaceStoredImage } from '@/storage/replace-stored-image';
import { StoresRepository } from '@/database/repositories/stores-repository';

@Injectable()
export class ChangeStoreBannerService {
  constructor(
    private storesRepository: StoresRepository,
    private storageService: StorageService,
  ) {}

  async execute(slug: string, file: Express.Multer.File) {
    const store = await this.storesRepository.findBySlug(slug);

    if (!store) {
      throw new NotFoundException('Resource not found.');
    }

    if (!store.bannerPublicId) {
      throw new NotFoundException('Resource Not Found');
    }

    await replaceStoredImage(
      this.storageService,
      store.bannerPublicId,
      {
        body: file.buffer,
        fileName: file.originalname,
        contentType: file.mimetype,
        folder: `vitrine-web/${slug}/banner`,
      },
      (newBanner) => this.storesRepository.saveBanner(
        store.id, newBanner.url, newBanner.public_id,
      ),
    );
  }
}
