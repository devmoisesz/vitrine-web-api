import { Cart, Prisma } from "@prisma/client";

export abstract class CartsRepository {
    abstract create(data: Prisma.CartUncheckedCreateInput): Promise<Cart>
    abstract findByUserIdAndStoreId(userId: string, storeId: string): Promise<Cart | null>
}