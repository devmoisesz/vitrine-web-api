import { CurrentUser } from '@/auth/current-user-decorator';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { UserPayload } from '@/auth/jwt-payload';
import { ListCartsService } from '@/use-cases/services/cart/list-carts.service';
import { Controller, Get, HttpCode, Query, UseGuards } from '@nestjs/common';

@Controller('/carts')
@UseGuards(JwtAuthGuard)
export class ListCartsController {
  constructor(private listCartsService: ListCartsService) {}

  @Get()
  @HttpCode(200)
  async handle(
    @Query('page') page: number = 1,
    @CurrentUser() user: UserPayload
  ) {   
    const userId = user.sub

    return await this.listCartsService.execute(userId, page);
  }
}
