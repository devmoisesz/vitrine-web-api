import { CurrentUser } from '@/auth/current-user-decorator';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { UserPayload } from '@/auth/jwt-payload';
import { OrderResponseSwaggerDto } from '@/http/zod/swagger/orders.swagger.dto';
import { ListOrdersService } from '@/use-cases/services/order/list-orders.service';
import { Controller, Get, HttpCode, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';

@Controller('/orders')
@UseGuards(JwtAuthGuard)
@ApiTags('List Orders')
@ApiBearerAuth()
export class ListOrdersController {
  constructor(private listOrdersService: ListOrdersService) {}

  @Get()
  @HttpCode(200)
  @ApiOperation({
    summary: 'List user orders',
    description: 'Returns all orders created by the authenticated user.',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    example: 1,
  })
  @ApiOkResponse({
    type: OrderResponseSwaggerDto,
    isArray: true,
  })
  async handle(
    @CurrentUser() user: UserPayload,
    @Query('page') page: number = 1,
  ) {
    const userId = user.sub;

    return await this.listOrdersService.execute(userId, page);
  }
}
