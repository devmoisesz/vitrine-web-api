import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { DeleteItemCartService } from '@/use-cases/services/cart/delete-item-cart.service';
import { Controller, Delete, HttpCode, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@Controller('/cart/:cartItemId')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiTags('Delete item Cart')
export class DeleteItemCartController {
  constructor(private deleteItemCartService: DeleteItemCartService) {}

  @Delete()
  @HttpCode(204)
  @ApiOperation({
    summary: 'Delete cart item',
    description: 'Removes a product item from the cart.',
  })
  async handle(
    @Param('cartItemId') cartItemId: string,
  ): Promise<void> {
    await this.deleteItemCartService.execute(cartItemId);
  }
}
