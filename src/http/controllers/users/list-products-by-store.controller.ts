import { Public } from '@/auth/public';
import { ProductResponseSwaggerDto } from '@/http/zod/swagger/products.swagger.dto';
import { ListProductsByStoreService } from '@/use-cases/services/products/list-products-by-store.service';
import { Controller, Get, HttpCode, Param, Query, Res } from '@nestjs/common';
import { ApiHeader, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { type Response } from 'express';

@Controller('/store/:slug/products')
@Public()
@ApiTags('List Products By Store')
export class ListProductsByStoreController {
  constructor(private listProductsByStoreService: ListProductsByStoreService) {}

  @Get()
  @HttpCode(200)
  @ApiOperation({
    summary: 'List products by store',
    description:
      'Returns all products from a specific store with optional filters and pagination.',
  })
  @ApiParam({
    name: 'slug',
    example: 'minha-loja',
    description: 'Store slug',
  })
  @ApiQuery({
    name: 'name',
    required: false,
    example: 'camisa',
  })
  @ApiQuery({
    name: 'categoryId',
    required: false,
  })
  @ApiQuery({
    name: 'subcategoryId',
    required: false,
  })
  @ApiQuery({
    name: 'page',
    required: false,
    example: 1,
  })
  @ApiHeader({
    name: 'X-Total-Count',
    description: 'Total number of products available',
  })
  @ApiOkResponse({
    type: ProductResponseSwaggerDto,
    isArray: true,
  })
  @ApiNotFoundResponse({
    description: 'Store not found.',
  })
  async handle(
    @Res({ passthrough: true }) res: Response,
    @Param('slug') slug: string,
    @Query('name') name?: string,
    @Query('categoryId') categoryId?: string,
    @Query('subcategoryId') subcategoryId?: string,
    @Query('page') page: number = 1,
  ) {
    const { products, total } = await this.listProductsByStoreService.execute(
      slug,
      page,
      name,
      categoryId,
      subcategoryId,
    );

    res.setHeader('X-Total-Count', total.toString())

    return products
  }
}
