import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Prisma, ProductImages } from '@prisma/client';
import { ProductsImagesRepository } from '@/database/repositories/products-images-repository';

@Injectable()
export class PrismaProductsImagesRepository implements ProductsImagesRepository {
  constructor(private readonly prisma: PrismaService) {}

    async create(data: Prisma.ProductImagesUncheckedCreateInput): Promise<ProductImages> {
        return await this.prisma.productImages.create({
            data: {
                image_url: data.image_url,
                storage_public_id: data.storage_public_id,
                productId: data.productId,
                is_main: data.is_main
            }
        })
    }

    async findManyByProductId(productId: string): Promise<ProductImages[]> {
        return await this.prisma.productImages.findMany({
            where: {
                productId
            }
        })
    }
}
