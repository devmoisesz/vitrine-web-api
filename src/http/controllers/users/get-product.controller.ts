import { Public } from '@/auth/public';
import { GetProductSwaggerDto } from '@/http/zod/swagger/products.swagger.dto';
import { GetProductService } from '@/use-cases/services/products/get-product.service';
import { Controller, Get, HttpCode, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiOkResponse } from '@nestjs/swagger';

@Controller('/products/:productId')
@Public()
@ApiTags('Get Product')
export class GetProductController {
  constructor(private getProductService: GetProductService) {}

  @Get()
  @HttpCode(200)
  @ApiOperation({
    summary: 'Get product',
    description: 'Returns product details and its images.',
  })
  @ApiOkResponse({
    type: GetProductSwaggerDto,
  })
  async handle(@Param('productId') productId: string) {
    return await this.getProductService.execute(productId);
  }
}
