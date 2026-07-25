import { CurrentUser } from '@/auth/current-user-decorator';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { UserPayload } from '@/auth/jwt-payload';
import { ListOrdersService } from '@/use-cases/services/order/list-orders.service';
import { Controller, Get, HttpCode, Query, UseGuards } from '@nestjs/common';

@Controller('/orders')
@UseGuards(JwtAuthGuard)
export class ListOrdersController {
  constructor(private listOrdersService: ListOrdersService) {}

  @Get()
  @HttpCode(200)
  async handle(
    @CurrentUser() user: UserPayload,
    @Query('page') page: number = 1
  ) {
    const userId = user.sub

    return await this.listOrdersService.execute(userId, page);
  }
}
