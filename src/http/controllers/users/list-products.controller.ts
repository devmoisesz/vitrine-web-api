import { Public } from '@/auth/public';
import { ProductResponseSwaggerDto } from '@/http/zod/swagger/products.swagger.dto';
import { ListProductsService } from '@/use-cases/services/products/list-products.service';
import { Controller, Get, HttpCode, Query, Res } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { type Response } from 'express';

@Controller('/products')
@Public()
@ApiTags('List Products')
export class ListProductsController {
  constructor(private listProductsService: ListProductsService) {}

  @Get()
  @HttpCode(200)
  @ApiOperation({
    summary: 'List products',
    description: 'Returns products with optional filters and pagination.',
  })
  @ApiOkResponse({
    type: ProductResponseSwaggerDto,
    isArray: true,
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
  async handle(
    @Res({ passthrough: true }) res: Response,
    @Query('name') name?: string,
    @Query('categoryId') categoryId?: string,
    @Query('subcategoryId') subcategoryId?: string,
    @Query('page') page: number = 1,
  ) {
    const { products, total } = await this.listProductsService.execute(
      page,
      name,
      categoryId,
      subcategoryId,
    );

    res.setHeader('X-Total-Count', total.toString());

    return products;
  }
}
