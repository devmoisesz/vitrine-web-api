import { Public } from '@/auth/public';
import { ListProductsByStoreService } from '@/use-cases/services/products/list-products-by-store.service';
import { Controller, Get, HttpCode, Param, Query } from '@nestjs/common';

@Controller('/store/:slug/products')
@Public()
export class ListProductsByStoreController {
  constructor(private listProductsByStoreService: ListProductsByStoreService) {}

  @Get()
  @HttpCode(200)
  async handle(
    @Param('slug') slug: string,
    @Query('name') name?: string,
    @Query('categoryId') categoryId?: string,
    @Query('subcategoryId') subcategoryId?: string,
    @Query('page') page: number = 1,
  ) {
    return await this.listProductsByStoreService.execute(
      slug,
      page,
      name,
      categoryId,
      subcategoryId,
    );
  }
}
