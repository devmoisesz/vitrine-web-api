import {
    ConflictException,
    Injectable,
    NotFoundException
} from '@nestjs/common';
import { StoresRepository } from '@/database/repositories/stores-repository';

@Injectable()
export class DeactivateStoreService {
  constructor(private storesRepository: StoresRepository) {}

  async execute(slug: string): Promise<void> {
    const store = await this.storesRepository.findBySlug(slug);

    if (!store) {
      throw new NotFoundException(
        'The requested resource could not be processed.',
      );
    }

    if (store.status === 'Inativa') {
      throw new ConflictException(
        'Unable to complete the requested operation.',
      );
    }

    await this.storesRepository.disable(slug);
  }
}