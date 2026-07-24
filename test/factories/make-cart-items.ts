import { CartItemsInMemoryRepository } from '../in-memory-repository/cart-items-in-memory-repository'

export function makeCartItems(
    cartItemsInMemoryRepository: CartItemsInMemoryRepository,
    cartId: string,
    productId: string,
    quantity: number,
    size?: string
){
    return cartItemsInMemoryRepository.create({
        cartId,
        productId,
        quantity,
        selectedSize: size ?? null
    })
}