import { Public } from '@/auth/public';
import { SubcategoryResponseSwaggerDto } from '@/http/zod/swagger/categories.swagger.dto';
import { ListSubcategoriesService } from '@/use-cases/services/products/list-subcategories.service';
import { Controller, Get, HttpCode, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';

@Controller('/subcategories')
@Public()
@ApiTags('List Subcategories')
export class ListSubcategoriesController {
  constructor(private listSubcategoriesService: ListSubcategoriesService) {}

  @Get()
  @HttpCode(200)
  @ApiOperation({
    summary: 'List subcategories',
    description: 'Returns all subcategories. Optionally filter by category.',
  })
  @ApiQuery({
    name: 'categoryId',
    required: false,
    description: 'Filter subcategories by category identifier.',
    example: 'clx123abc456',
  })
  @ApiOkResponse({
    description: 'Subcategories retrieved successfully.',
    type: SubcategoryResponseSwaggerDto,
    isArray: true,
  })
  async handle(@Query('categoryId') categoryId?: string) {
    return await this.listSubcategoriesService.execute(categoryId);
  }
}
