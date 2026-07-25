import { CartItems, Prisma } from "@prisma/client";

export type SaveCartItemInput = Prisma.CartItemsUncheckedCreateInput | (Partial<Prisma.CartItemsUncheckedCreateInput> & { id: string });

export abstract class CartItemsRepository {
    abstract create(data: Prisma.CartItemsUncheckedCreateInput): Promise<CartItems>
    abstract save(data: SaveCartItemInput): Promise<void>
    abstract findByCartId(cartId: string): Promise<CartItems[]>
    abstract findAllItemsByCart(cartId: string): Promise<CartItems[]>
    abstract findByCartProductAndSize(cartId: string, productId: string, selectedSize?: string): Promise<CartItems | null>
    abstract findById(id: string): Promise<CartItems | null>
    abstract delete(id: string): Promise<void>
}