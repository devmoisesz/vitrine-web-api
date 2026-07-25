import { Public } from '@/auth/public';
import { GetProductService } from '@/use-cases/services/products/get-product.service';
import { Controller, Get, HttpCode, Param } from '@nestjs/common';

@Controller('/products/:productId')
@Public()
export class GetProductController {
  constructor(private getProductService: GetProductService) {}

  @Get()
  @HttpCode(200)
  async handle(@Param('productId') productId: string) {
    return await this.getProductService.execute(productId);
  }
}
