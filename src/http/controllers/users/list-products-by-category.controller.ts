import { Public } from '@/auth/public';
import { ListProductsByCategoryService } from '@/use-cases/services/products/list-products-by-category.service';
import { Controller, Get, HttpCode, Param, Query } from '@nestjs/common';

@Controller('/products/category/:slug')
@Public()
export class ListProductsByCategoryController {
  constructor(private listProductsByCategoryService: ListProductsByCategoryService) {}

  @Get()
  @HttpCode(200)
  async handle(
    @Param('slug') slug: string,
    @Query('page') page: number = 1
  ) {
    return await this.listProductsByCategoryService.execute(slug, page);
  }
}
