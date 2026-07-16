import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateProductInput } from '@/database/repositories/products-repository';
import { Product } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/client';

@Injectable()
export class PrismaProductsRepository implements PrismaProductsRepository {
  constructor(private readonly prisma: PrismaService) {}

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
