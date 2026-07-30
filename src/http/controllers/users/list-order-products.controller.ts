import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { OrderProductResponseSwaggerDto } from '@/http/zod/swagger/orders.swagger.dto';
import { ListOrderProductsService } from '@/use-cases/services/order/list-order-products.service';
import {
  Controller,
  Get,
  HttpCode,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';

@Controller('/orders/:orderId')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiTags('List Order Products')
export class ListOrderProductsController {
  constructor(private listOrderProducts: ListOrderProductsService) {}

  @Get()
  @HttpCode(200)
  @ApiOperation({
    summary: 'List order products',
    description: 'Returns all products from a specific order.',
  })
  @ApiParam({
    name: 'orderId',
    example: 'clx123abc',
    description: 'Order identifier',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    example: 1,
  })
  @ApiOkResponse({
    type: OrderProductResponseSwaggerDto,
    isArray: true,
  })
  @ApiNotFoundResponse({
    description: 'Order not found.',
  })
  async handle(
    @Param('orderId') orderId: string,
    @Query('page') page: number = 1,
  ) {
    return await this.listOrderProducts.execute(orderId, page);
  }
}
