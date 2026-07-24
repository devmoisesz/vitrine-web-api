import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Cart, Prisma } from '@prisma/client';
import { CartsRepository } from '@/database/repositories/carts-repository';

@Injectable()
export class PrismaCartsRepository implements CartsRepository {
  constructor(private readonly prisma: PrismaService) {}

    async create(data: Prisma.CartUncheckedCreateInput): Promise<Cart> {
        return await this.prisma.cart.create({
            data: {
                userId: data.userId,
                storeId: data.storeId
            }
        })
    }

    async findByUserIdAndStoreId(userId: string, storeId: string): Promise<Cart | null> {
        const cart = await this.prisma.cart.findUnique({
            where: {
                userId_storeId: {
                    userId,
                    storeId
                }
            }
        })

        if(!cart){
            return null
        }

        return cart
    }

}
