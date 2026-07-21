import { RequireRoles } from '@/auth/authorization/roles.decorator';
import { StoreAccessGuard } from '@/auth/authorization/store-access.guard';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { ZodValidationPipes } from '@/http/zod/pipes/zod-validation-pipe';
import {
  type EditProductBodySchema,
  editProductBodySchema,
} from '@/http/zod/schema/products';
import { EditProductService } from '@/use-cases/services/products/edit-product.service';
import {
  Body,
  Controller,
  HttpCode,
  Param,
  Put,
  UseGuards,
} from '@nestjs/common';

@Controller('/stores/:slug/products/:productId')
@RequireRoles('FUNCIONARIO', 'PROPRIETARIO')
@UseGuards(JwtAuthGuard, StoreAccessGuard)
export class EditProductController {
  constructor(private editProductService: EditProductService) {}

  @Put()
  @HttpCode(204)
  async handle(
    @Body(new ZodValidationPipes(editProductBodySchema))
    body: EditProductBodySchema,

    @Param('productId') productId: string,
  ) {
    await this.editProductService.execute(productId, {
      newNameProduct: body.newNameProduct,
      newTags: body.newTags,
      newDescription: body.newDescription,
      newPrice: body.newPrice,
      newSizes: body.newSizes,
      newStock: body.newStock,
      newCategory: body.newCategory,
      newSubcategory: body.newSubcategory,
    });
  }
}
