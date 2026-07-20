import { Public } from '@/auth/public';
import { ListProductsBySubcategoryService } from '@/use-cases/services/products/list-products-by-subcategory.service';
import { Controller, Get, HttpCode, Param, Query } from '@nestjs/common';

@Controller('/products/category/:slugCategory/subcategory/:slugSubcategory')
@Public()
export class ListProductsBySubcategoryController {
  constructor(
    private listProductsBySubcategoryService: ListProductsBySubcategoryService,
  ) {}

  @Get()
  @HttpCode(200)
  async handle(
    @Param('slugCategory') slugCategory: string,
    @Param('slugSubcategory') slugSubcategory: string,
    @Query('page') page: number = 1,
  ) {
    return await this.listProductsBySubcategoryService.execute(
      slugCategory,
      slugSubcategory,
      page,
    );
  }
}
