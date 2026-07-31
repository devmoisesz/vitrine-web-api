import { ProductsRepository } from '@/database/repositories/products-repository';
import { StoresRepository } from '@/database/repositories/stores-repository';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Product } from '@prisma/client';
import { InputStoreManageProductsDto } from './dtos/list-store-manage-products.dto';

@Injectable()
export class ListStoreManageProductsService {
  constructor(
    private productsRepository: ProductsRepository,
    private storesRepository: StoresRepository,
  ) {}

  async execute(
    data: InputStoreManageProductsDto,
  ): Promise<{ products: Product[]; total: number }> {
    const store = await this.storesRepository.findBySlug(data.slugStore);

    if (!store) {
      throw new NotFoundException('Store not found');
    }

    return await this.productsRepository.findAllByStoreManage(
      store.id,
      data.page,
      data.name,
      data.categoryId,
      data.subcategoryId,
      data.status,
    );
  }
}
