import { Public } from '@/auth/public';
import { ListProductsService } from '@/use-cases/services/products/list-products.service';
import { Controller, Get, HttpCode, Query, Res } from '@nestjs/common';
import { type Response } from 'express';

@Controller('/products')
@Public()
export class ListProductsController {
  constructor(private listProductsService: ListProductsService) {}

  @Get()
  @HttpCode(200)
  async handle(
    @Res({ passthrough: true }) res: Response,
    @Query('name') name?: string,
    @Query('categoryId') categoryId?: string,
    @Query('subcategoryId') subcategoryId?: string,
    @Query('page') page: number = 1,
  ) {
    const { products, total } = await this.listProductsService.execute(page, name, categoryId, subcategoryId);

    res.setHeader('X-Total-Count', total.toString())

    return products
  }
}
