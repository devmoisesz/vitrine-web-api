import { CartItems, Prisma } from '@prisma/client';
import { randomUUID } from 'node:crypto';
import {
  CartItemsRepository,
  SaveCartItemInput,
} from '@/database/repositories/cart-items-repository';
import { ProductsInMemoryRepository } from './product-in-memory-repository';
import { ProductsImagesInMemoryRepository } from './product-images-in-memory-repository';
import { CategoriesInMemoryRepository } from './categories-in-memory-repository';
import { SubcategoriesInMemoryRepository } from './subcategories-in-memory-repository';

export class CartItemsInMemoryRepository implements CartItemsRepository {
  public items: CartItems[] = [];

  constructor(
    private productsRepository?: ProductsInMemoryRepository,
    private productImagesRepository?: ProductsImagesInMemoryRepository,
    private categoriesRepository?: CategoriesInMemoryRepository,
    private subcategoriesRepository?: SubcategoriesInMemoryRepository,
  ) {}

  async delete(id: string): Promise<void> {
    const cartItems = this.items.findIndex((item) => item.id === id);

    this.items.splice(cartItems, 1);
  }

  async findByCartProductAndSize(
    cartId: string,
    productId: string,
    selectedSize?: string,
  ): Promise<CartItems | null> {
    const cartItems = await this.items.find(
      (item) =>
        item.cartId === cartId &&
        item.productId === productId &&
        item.selectedSize === selectedSize,
    );

    if (!cartItems) return null;

    return cartItems;
  }

  async findById(id: string): Promise<CartItems | null> {
    const cartItems = this.items.find((item) => item.id === id);
    
    if (!cartItems) return null;

    return cartItems;
  }

  async create(data: Prisma.CartItemsUncheckedCreateInput): Promise<CartItems> {
    const cartItems = {
      id: randomUUID(),
      cartId: data.cartId,
      productId: data.productId,
      quantity: data.quantity,
      selectedSize: data.selectedSize ?? null,
      createdAt: new Date(),
    };

    this.items.push(cartItems);
    
    return cartItems
  }

  async save(data: SaveCartItemInput): Promise<void> {
    const itemIndex =
      'id' in data && data.id
        ? this.items.findIndex((item) => item.id === data.id)
        : -1;

    if (itemIndex >= 0) {
      this.items[itemIndex] = {
        ...this.items[itemIndex],
        quantity: data.quantity ?? this.items[itemIndex].quantity,
        selectedSize:
          data.selectedSize !== undefined
            ? data.selectedSize
            : this.items[itemIndex].selectedSize,
      };
    } else {
      const createData = data as Prisma.CartItemsUncheckedCreateInput;

      const newItem: CartItems = {
        id: createData.id ?? randomUUID(),
        cartId: createData.cartId,
        productId: createData.productId,
        quantity: createData.quantity,
        selectedSize: createData.selectedSize ?? null,
        createdAt: new Date(),
      };

      this.items.push(newItem);
    }
  }

  async findByCartId(cartId: string): Promise<CartItems[]> {
    return this.items.filter((item) => item.cartId == cartId);
  }

  async findAllItemsByCart(cartId: string): Promise<CartItems[]> {
    const cartItems = this.items.filter((item) => item.cartId === cartId);

    cartItems.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });

    return cartItems.map((item) => {
      const product = this.productsRepository?.items.find(
        (p) => p.id === item.productId,
      );

      const category =
        product?.categoryId && this.categoriesRepository
          ? this.categoriesRepository.items.find(
              (c) => c.id === product.categoryId,
            )
          : null;

      const subcategory =
        product?.subcategoryId && this.subcategoriesRepository
          ? this.subcategoriesRepository.items.find(
              (s) => s.id === product.subcategoryId,
            )
          : null;

      const productsImages = this.productImagesRepository
        ? this.productImagesRepository.items
            .filter((img) => img.productId === item.productId)
            .map((img) => ({ image_url: img.image_url }))
        : [];

      return {
        ...item,
        product: product
          ? {
              name: product.name,
              price: product.price,
              products_images: productsImages,
              category: category ? { name: category.name } : null,
              subcategory: subcategory ? { name: subcategory.name } : null,
            }
          : null,
      };
    });
  }
}
