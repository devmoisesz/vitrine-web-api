import { RequireRoles } from '@/auth/authorization/roles.decorator';
import { StoreAccessGuard } from '@/auth/authorization/store-access.guard';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { DeleteProductService } from '@/use-cases/services/products/delete-product.service';
import {
    Controller, Delete, HttpCode, Param, UseGuards
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiUnauthorizedResponse, ApiNotFoundResponse } from '@nestjs/swagger';

@Controller('/stores/:slug/products/:productId/')
@RequireRoles('FUNCIONARIO' ,'PROPRIETARIO')
@UseGuards(JwtAuthGuard, StoreAccessGuard)
@ApiTags('Delete Product')
@ApiBearerAuth()
export class DeleteProductController {
  constructor(
    private deleteProductService: DeleteProductService,
  ) {}

  @Delete()
  @HttpCode(204)
  @ApiOperation({
    summary: 'Delete product',
    description:
      'Deletes a product and removes all associated images from storage.',
  })

  @ApiUnauthorizedResponse({
    description:
      'Invalid authentication credentials.',
  })

  @ApiNotFoundResponse({
    description:
      'Product not found.',
  })
  async handle(
    @Param('productId') productId: string,
  ) {
    return await this.deleteProductService.execute(productId);
  }
}
