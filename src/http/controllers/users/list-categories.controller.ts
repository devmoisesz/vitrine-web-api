import { Public } from '@/auth/public';
import { ListCategoriesService } from '@/use-cases/services/products/list-categories.service';
import { Controller, Get, HttpCode } from '@nestjs/common';

@Controller('/categories')
@Public()
export class ListCategoriesController {
  constructor(private listCategoriesService: ListCategoriesService) {}

  @Get()
  @HttpCode(200)
  async handle(
  ) {
    return await this.listCategoriesService.execute();
  }
}
