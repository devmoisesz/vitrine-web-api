import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { ZodValidationPipes } from '@/http/zod/pipes/zod-validation-pipe';
import {
  type UpdateCartItemBodySchema,
  updateCartItemBodySchema,
} from '@/http/zod/schema/products';
import { UpdateCartItemBodySwaggerDto } from '@/http/zod/swagger/products.swagger.dto';
import { EditSelectedProductService } from '@/use-cases/services/cart/edit-selected-product.service';
import {
  Body,
  Controller,
  HttpCode,
  Param,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';

@Controller('/cart/:cartItemId')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiTags('Edit Selected Product')
export class EditSelectedProductController {
  constructor(private editSelectedProductService: EditSelectedProductService) {}

  @Put()
  @HttpCode(204)
  @ApiOperation({
    summary: 'Update cart item',
    description: 'Updates quantity or selected size of a product in the cart.',
  })
  @ApiBody({
    type: UpdateCartItemBodySwaggerDto,
  })
  async handle(
    @Param('cartItemId') cartItemId: string,
    @Body(new ZodValidationPipes(updateCartItemBodySchema))
    body: UpdateCartItemBodySchema,
  ): Promise<void> {
    const { quantity, size } = body;

    await this.editSelectedProductService.execute(cartItemId, quantity, size);
  }
}
