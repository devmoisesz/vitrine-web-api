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
import { ApiBadRequestResponse, ApiBearerAuth, ApiBody, ApiConflictResponse, ApiNotFoundResponse, ApiOperation, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';

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
  @ApiBadRequestResponse({
    description: 'Invalid request data or selected size is invalid.',
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid authentication credentials.',
  })
  @ApiNotFoundResponse({
    description: 'The requested cart item or product could not be found.',
  })
  @ApiConflictResponse({
    description:
      'Unable to process the request. Requested quantity exceeds available stock.',
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
