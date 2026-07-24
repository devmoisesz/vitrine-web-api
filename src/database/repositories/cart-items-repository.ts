import { CartItems, Prisma } from "@prisma/client";

export abstract class CartItemsRepository {
    abstract create(data: Prisma.CartItemsUncheckedCreateInput): Promise<void>
    abstract save(data: Prisma.CartItemsUncheckedCreateInput): Promise<void>
    abstract findByCartId(cartId: string): Promise<CartItems[]>
}