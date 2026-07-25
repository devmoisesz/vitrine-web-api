import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { RegisterOrderService } from '@/use-cases/services/order/register-order.service';
import { Controller, HttpCode, Param, Post, UseGuards } from '@nestjs/common';

@Controller('/cart/:cartId/order')
@UseGuards(JwtAuthGuard)
export class RegisterOrderController {
  constructor(private registerOrderService: RegisterOrderService) {}

  @Post()
  @HttpCode(201)
  async handle(
    @Param('cartId') cartId: string,
  ): Promise<void> {
    await this.registerOrderService.execute(cartId);
  }
}
