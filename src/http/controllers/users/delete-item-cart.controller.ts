import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { DeleteItemCartService } from '@/use-cases/services/cart/delete-item-cart.service';
import { Controller, Delete, HttpCode, Param, UseGuards } from '@nestjs/common';

@Controller('/cart/:cartItemId')
@UseGuards(JwtAuthGuard)
export class DeleteItemCartController {
  constructor(private deleteItemCartService: DeleteItemCartService) {}

  @Delete()
  @HttpCode(204)
  async handle(
    @Param('cartItemId') cartItemId: string,
  ): Promise<void> {
    await this.deleteItemCartService.execute(cartItemId);
  }
}
