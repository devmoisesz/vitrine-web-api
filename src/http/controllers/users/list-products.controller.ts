import { Public } from '@/auth/public';
import { ListProductsService } from '@/use-cases/services/products/list-products.service';
import { Controller, Get, HttpCode, Query } from '@nestjs/common';

@Controller('/products')
@Public()
export class ListProductsController {
  constructor(private listProductsService: ListProductsService) {}

  @Get()
  @HttpCode(200)
  async handle(
    @Query('name') name?: string,
    @Query('categoryId') categoryId?: string,
    @Query('subcategoryId') subcategoryId?: string,
    @Query('page') page: number = 1
  ) {
    return await this.listProductsService.execute(page, name, categoryId, subcategoryId);
  }
}
