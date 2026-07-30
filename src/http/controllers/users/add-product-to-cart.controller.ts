import { CurrentUser } from '@/auth/current-user-decorator';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { UserPayload } from '@/auth/jwt-payload';
import { ZodValidationPipes } from '@/http/zod/pipes/zod-validation-pipe';
import {
  type AddProductToCart,
  addProductToCart,
} from '@/http/zod/schema/products';
import { AddProductToCartBodySwaggerDto } from '@/http/zod/swagger/products.swagger.dto';
import { AddProductToCartService } from '@/use-cases/services/cart/add-product-to-cart.service';
import {
  Body,
  Controller,
  HttpCode,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBadRequestResponse, ApiBearerAuth, ApiBody, ApiConflictResponse, ApiNotFoundResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

@Controller('/products/:productId/cart')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiTags('Add Product to Cart')
export class AddProductToCartController {
  constructor(private addProductToCartService: AddProductToCartService) {}

  @Post()
  @HttpCode(201)
  @ApiOperation({
    summary: 'Add product to cart',
    description:
      'Adds a product with selected quantity and size to the user cart.',
  })
  @ApiBody({
    type: AddProductToCartBodySwaggerDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid product size or request data.',
  })
  @ApiConflictResponse({
    description: 'Product unavailable or quantity exceeds stock.',
  })
  @ApiNotFoundResponse({
    description: 'Product not found.',
  })
  async handle(
    @CurrentUser() user: UserPayload,
    @Param('productId') productId: string,
    @Body(new ZodValidationPipes(addProductToCart)) body: AddProductToCart,
  ): Promise<void> {
    const userId = user.sub;

    const { quantity, size } = body;

    await this.addProductToCartService.execute(
      userId,
      productId,
      quantity,
      size,
    );
  }
}
