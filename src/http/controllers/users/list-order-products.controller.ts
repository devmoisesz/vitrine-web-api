import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { ListOrderProductsService } from '@/use-cases/services/order/list-order-products.service';
import { Controller, Get, HttpCode, Param, Query, UseGuards } from '@nestjs/common';

@Controller('/orders/:orderId')
@UseGuards(JwtAuthGuard)
export class ListOrderProductsController {
  constructor(private listOrderProducts: ListOrderProductsService) {}

  @Get()
  @HttpCode(200)
  async handle(
    @Param('orderId') orderId: string,
    @Query('page') page: number = 1
  ) {
    return await this.listOrderProducts.execute(orderId, page);
  }
}
