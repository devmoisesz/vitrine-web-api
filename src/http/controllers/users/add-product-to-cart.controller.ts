import { CurrentUser } from '@/auth/current-user-decorator';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { UserPayload } from '@/auth/jwt-payload';
import { ZodValidationPipes } from '@/http/zod/pipes/zod-validation-pipe';
import { type AddProductToCart, addProductToCart } from '@/http/zod/schema/products';
import { AddProductToCartService } from '@/use-cases/services/cart/add-product-to-cart.service';
import { Body, Controller, HttpCode, Param, Post, UseGuards } from '@nestjs/common';

@Controller('/products/:productId/cart')
@UseGuards(JwtAuthGuard)
export class AddProductToCartController {
  constructor(private addProductToCartService: AddProductToCartService) {}

  @Post()
  @HttpCode(201)
  async handle(
    @CurrentUser() user: UserPayload,
    @Param('productId') productId: string,
    @Body(new ZodValidationPipes(addProductToCart)) body: AddProductToCart
  ): Promise<void> {
    const userId = user.sub;

    const { quantity, size } = body

    await this.addProductToCartService.execute(userId, productId, quantity, size);
  }
}
