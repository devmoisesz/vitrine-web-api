import { ProductsRepository } from '@/database/repositories/products-repository';
import { StoresRepository } from '@/database/repositories/stores-repository';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Product } from '@prisma/client';

@Injectable()
export class ListProductsByStoreService {
  constructor(
    private productsRepository: ProductsRepository,
    private storesRepository: StoresRepository,
  ) {}

  async execute(
    slugStore: string,
    page: number,
    name?: string,
    categoryId?: string,
    subcategoryId?: string,
  ): Promise<Product[]> {
    const store = await this.storesRepository.findBySlug(slugStore)

    if(!store){
        throw new NotFoundException('Store not found')
    }

    return await this.productsRepository.findManyByStore(store.id, page, name, categoryId, subcategoryId)
  }
}
