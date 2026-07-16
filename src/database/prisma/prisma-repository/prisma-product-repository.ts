import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateProductInput, ProductsRepository } from '@/database/repositories/products-repository';
import { Product } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/client';

@Injectable()
export class PrismaProductsRepository implements ProductsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async activateProduct(id: string, status: 'ATIVO'): Promise<void> {
    await this.prisma.product.update({
      where: {
        id
      },
      data: {
        status
      }
    })
  }

  async findById(id: string): Promise<Product | null> {
    const product = await this.prisma.product.findUnique({
      where: {
        id
      }
    })

    if(!product) throw new Error()

    return product
  }

  async create(data: CreateProductInput): Promise<Product> {
    const { tags, ...productData } = data;

    const product = await this.prisma.product.create({
      data: {
        ...productData,
        price: new Decimal(data.price),
        tags: {
          connectOrCreate: tags.map((tagName) => ({
            where: { name: tagName },
            create: { name: tagName },
          })),
        },
      },
    });

    return product;
  }
}
