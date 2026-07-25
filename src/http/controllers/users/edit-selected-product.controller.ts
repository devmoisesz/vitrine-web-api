import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { ZodValidationPipes } from '@/http/zod/pipes/zod-validation-pipe';
import { type UpdateCartItemBodySchema, updateCartItemBodySchema } from '@/http/zod/schema/products';
import { EditSelectedProductService } from '@/use-cases/services/cart/edit-selected-product.service';
import { Body, Controller, HttpCode, Param, Put, UseGuards } from '@nestjs/common';

@Controller('/cart/:cartItemId')
@UseGuards(JwtAuthGuard)
export class EditSelectedProductController {
  constructor(private editSelectedProductService: EditSelectedProductService) {}

  @Put()
  @HttpCode(204)
  async handle(
    @Param('cartItemId') cartItemId: string,
    @Body(new ZodValidationPipes(updateCartItemBodySchema)) body: UpdateCartItemBodySchema
  ): Promise<void> {
    const { quantity, size } = body

    await this.editSelectedProductService.execute(cartItemId, quantity, size);
  }
}
