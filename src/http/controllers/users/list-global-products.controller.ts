import { Public } from '@/auth/public';
import { ListGlobalProductsService } from '@/use-cases/services/products/list-global-products.service';
import { Controller, Get, HttpCode, Query } from '@nestjs/common';

@Controller('/products')
@Public()
export class ListGlobalProductsController {
  constructor(private listGlobalProductsService: ListGlobalProductsService) {}

  @Get()
  @HttpCode(200)
  async handle(
    @Query('name') name?: string,
    @Query('page') page: number = 1
  ) {
    return await this.listGlobalProductsService.execute(page, name);
  }
}
