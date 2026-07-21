import { Public } from '@/auth/public';
import { ListSubcategoriesService } from '@/use-cases/services/products/list-subcategories.service';
import { Controller, Get, HttpCode, Query } from '@nestjs/common';

@Controller('/subcategories')
@Public()
export class ListSubcategoriesController {
  constructor(private listSubcategoriesService: ListSubcategoriesService) {}

  @Get()
  @HttpCode(200)
  async handle(@Query('categoryId') categoryId?: string) {
    return await this.listSubcategoriesService.execute(categoryId);
  }
}
