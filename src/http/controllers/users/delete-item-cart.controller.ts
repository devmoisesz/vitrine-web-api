import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { DeleteItemCartService } from '@/use-cases/services/cart/delete-item-cart.service';
import { Controller, Delete, HttpCode, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiNotFoundResponse, ApiOperation, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';

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
  @ApiUnauthorizedResponse({
    description: 'Invalid authentication credentials.',
  })
  @ApiNotFoundResponse({
    description: 'The requested cart item could not be found.',
  })
  async handle(@Param('cartItemId') cartItemId: string): Promise<void> {
    await this.deleteItemCartService.execute(cartItemId);
  }
}
