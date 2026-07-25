import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { ListCartProductsService } from '@/use-cases/services/cart/list-cart-products.service';
import { Controller, Get, HttpCode, Param, UseGuards } from '@nestjs/common';

@Controller('/cart/:cartId/products')
@UseGuards(JwtAuthGuard)
export class ListCartProductsController {
  constructor(private listCartProductsService: ListCartProductsService) {}

  @Get()
  @HttpCode(200)
  async handle(@Param('cartId') cartId: string) {
    return await this.listCartProductsService.execute(cartId);
  }
}
