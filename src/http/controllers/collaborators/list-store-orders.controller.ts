import { RequireRoles } from '@/auth/authorization/roles.decorator';
import { StoreAccessGuard } from '@/auth/authorization/store-access.guard';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { ListStoreOrdersService } from '@/use-cases/services/order/list-store-orders.service';
import {
  Controller,
  Get,
  HttpCode,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';

@Controller('/store/:slug/orders')
@RequireRoles('FUNCIONARIO', 'PROPRIETARIO')
@UseGuards(JwtAuthGuard, StoreAccessGuard)
export class ListStoreOrdersController {
  constructor(private listStoreOrdersService: ListStoreOrdersService) {}

  @Get()
  @HttpCode(200)
  async handle(@Param('slug') slug: string, @Query('page') page: number = 1) {
    return await this.listStoreOrdersService.execute(slug, page);
  }
}
