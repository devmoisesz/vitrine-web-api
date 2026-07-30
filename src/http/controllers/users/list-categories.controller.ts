import { Public } from '@/auth/public';
import { CategoryResponseSwaggerDto } from '@/http/zod/swagger/categories.swagger.dto';
import { ListCategoriesService } from '@/use-cases/services/products/list-categories.service';
import { Controller, Get, HttpCode } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

@Controller('/categories')
@Public()
@ApiTags('List Categories')
export class ListCategoriesController {
  constructor(private listCategoriesService: ListCategoriesService) {}

  @Get()
  @HttpCode(200)
  @ApiOperation({
    summary: 'List categories',
    description: 'Returns all available product categories.',
  })
  @ApiOkResponse({
    type: CategoryResponseSwaggerDto,
    isArray: true,
  })
  async handle() {
    return await this.listCategoriesService.execute();
  }
}
