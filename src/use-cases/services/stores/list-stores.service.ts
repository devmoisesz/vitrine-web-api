import { StoresRepository } from '@/database/repositories/stores-repository';
import { Injectable } from '@nestjs/common';
import type { PublicStoreDto } from './dtos/public-store.dto';
import { toPublicStore } from './public-store.mapper';

@Injectable()
export class ListStoresService {
  constructor(private storesRepository: StoresRepository) {}

  async execute(
    page: number,
    name?: string,
  ): Promise<{ stores: PublicStoreDto[]; total: number }> {
    const { stores, total } = await this.storesRepository.findMany(page, name);
    return { stores: stores.map(toPublicStore), total };
  }
}
