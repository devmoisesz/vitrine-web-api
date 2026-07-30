import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { RegisterOrderService } from '@/use-cases/services/order/register-order.service';
import { Controller, HttpCode, Param, Post, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiUnauthorizedResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
  ApiConflictResponse,
} from '@nestjs/swagger';

@Controller('/cart/:cartId/order')
@UseGuards(JwtAuthGuard)
@ApiTags('Register Order')
@ApiBearerAuth()
export class RegisterOrderController {
  constructor(private registerOrderService: RegisterOrderService) {}

  @Post()
  @HttpCode(201)
  @ApiOperation({
    summary: 'Create order from cart',
    description:
      'Creates a new order using the products currently in the cart.',
  })
  @ApiParam({
    name: 'cartId',
    description: 'Cart identifier.',
    example: 'clx123abc456',
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication required.',
  })
  @ApiNotFoundResponse({
    description: 'Cart not found.',
  })
  @ApiBadRequestResponse({
    description: 'Cart is empty or request cannot be processed.',
  })
  @ApiConflictResponse({
    description: 'Product is unavailable or there is insufficient stock.',
  })
  async handle(@Param('cartId') cartId: string): Promise<void> {
    await this.registerOrderService.execute(cartId);
  }
}
