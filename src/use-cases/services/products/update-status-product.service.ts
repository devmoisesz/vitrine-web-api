import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ProductsRepository } from '@/database/repositories/products-repository';

@Injectable()
export class UpdateStatusProductService {
  constructor(private productsRepository: ProductsRepository) {}

  async execute(productId: string, status: 'ATIVO' | 'INATIVO'): Promise<void> {
    const product = await this.productsRepository.findById(productId);

    if (!product) {
      throw new NotFoundException('Resource not found');
    }

    if (product.status === status) {
      throw new ConflictException('Unable to complete the requested operation');
    }

    if (status === 'ATIVO') {
      await this.productsRepository.activateProduct(product.id, status);
    }

    if (status === 'INATIVO') {
      await this.productsRepository.disableProduct(product.id, status);
    }
  }
}
