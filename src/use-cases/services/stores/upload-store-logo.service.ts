import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { StorageService } from '@/storage/storage.service';
import { StoresRepository } from '@/database/repositories/stores-repository';

@Injectable()
export class UploadStoreLogoService {
  constructor(
    private storesRepository: StoresRepository,
    private storageService: StorageService,
  ) {}

  async execute(slug: string, file: Express.Multer.File) {
    const store = await this.storesRepository.findBySlug(slug);

    if (!store) {
      throw new NotFoundException('Resource not found.');
    }

    if (store.logo_image_url) {
      throw new ConflictException('Already has a logo');
    }

    const logo = await this.storageService.upload({
      body: file.buffer,
      fileName: file.originalname,
      contentType: file.mimetype,
      folder: `vitrine-web/${slug}/logos`,
    });

    await this.storesRepository.saveImage(store.id, logo.url, logo.public_id);
  }
}
