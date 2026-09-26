import { StoresRepository } from '@/database/repositories/stores-repository';
import { Injectable } from '@nestjs/common';
import type { PublicHomeStoreDto } from './dtos/public-store.dto';
import { toPublicHomeStore } from './public-store.mapper';

@Injectable()
export class ListStoreHomeService {
  constructor(private storesRepository: StoresRepository) {}

  async execute(
    page: number,
    name?: string,
  ): Promise<{ stores: PublicHomeStoreDto[]; total: number }> {
    const { stores, total } = await this.storesRepository.findManyWithProducts(
      page,
      name,
    );
    return { stores: stores.map(toPublicHomeStore), total };
  }
}
