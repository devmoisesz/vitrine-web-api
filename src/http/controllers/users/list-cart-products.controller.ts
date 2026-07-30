import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { CartProductResponseSwaggerDto } from '@/http/zod/swagger/carts.swagger.dto';
import { ListCartProductsService } from '@/use-cases/services/cart/list-cart-products.service';
import { Controller, Get, HttpCode, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';

@Controller('/cart/:cartId/products')
@UseGuards(JwtAuthGuard)
@ApiTags('List Cart Products')
@ApiBearerAuth()
export class ListCartProductsController {
  constructor(private listCartProductsService: ListCartProductsService) {}

  @Get()
  @HttpCode(200)
  @ApiOperation({
    summary: 'List cart products',
    description: 'Returns all products from a specific cart.',
  })
  @ApiParam({
    name: 'cartId',
    example: '18bf7a30-5d67-48b7-b287-21fb4995016c',
  })
  @ApiOkResponse({
    type: CartProductResponseSwaggerDto,
    isArray: true,
  })
  @ApiNotFoundResponse({
    description: 'Cart not found.',
  })
  async handle(@Param('cartId') cartId: string) {
    return await this.listCartProductsService.execute(cartId);
  }
}
