import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import {
  CreateProductInput,
  ProductsRepository,
  UpdateProductInput,
} from '@/database/repositories/products-repository';
import { Prisma, Product } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/client';

@Injectable()
export class PrismaProductsRepository implements ProductsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findMany(page: number, name?: string): Promise<Product[]> {
    const pageSize = 40

    return await this.prisma.product.findMany({
      where: {
        status: 'ATIVO',
        store: {
          status: 'ATIVA'
        },
        OR: name ? [
          { name: { contains: name, mode: 'insensitive' } },
          { description: { contains: name, mode: 'insensitive' } },
        ] : undefined,
      },
      include: {
        store: {
          select: {
            id: true,
            name: true,
            slug: true,
            logo_image_url: true
          },
        },
        products_images: {
          where: {
            is_main: true,
          },
          select: {
            image_url: true
          }
        }
      },
      take: pageSize,
      skip: (page - 1) * pageSize,
      orderBy: {
        createdAt: 'desc'
      }
    })
  }

  async delete(id: string): Promise<void> {
    await this.prisma.product.delete({
      where: {
        id
      }
    })
  }

  async save(product: UpdateProductInput): Promise<Product> {
    const { id, tags, price, ...productData } = product;
    const updateData: Prisma.ProductUncheckedUpdateInput = {
      ...productData,
    };

    if (typeof price !== 'undefined') {
      updateData.price = new Decimal(price);
    }

    let updatedProduct = await this.prisma.product.update({
      where: { id },
      data: updateData,
    });

    if (typeof tags !== 'undefined') {
      await this.prisma.product.update({
        where: { id },
        data: {
          tags: {
            set: [],
          },
        },
      });

      updatedProduct = await this.prisma.product.update({
        where: { id },
        data: {
          tags: {
            connectOrCreate: tags.map((tagName) => ({
              where: { name: tagName },
              create: { name: tagName },
            })),
          },
        },
      });
    }

    return updatedProduct;
  }

  async activateProduct(id: string, status: 'ATIVO'): Promise<void> {
    await this.prisma.product.update({
      where: {
        id,
      },
      data: {
        status,
      },
    });
  }

  async disableProduct(id: string, status: 'INATIVO'): Promise<void> {
    await this.prisma.product.update({
      where: {
        id,
      },
      data: {
        status,
      },
    });
  }

  async findById(id: string): Promise<Product | null> {
    return await this.prisma.product.findUnique({
      where: {
        id,
      },
    });
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
