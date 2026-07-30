import { RequireRoles } from '@/auth/authorization/roles.decorator';
import { StoreAccessGuard } from '@/auth/authorization/store-access.guard';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { DeleteProductImageService } from '@/use-cases/services/products/delete-product-image.service';
import {
  Controller, Delete, HttpCode, Param, Query, UseGuards
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery, ApiUnauthorizedResponse, ApiNotFoundResponse } from '@nestjs/swagger';

@Controller('/stores/:slug/productimages/:productId/:imageId')
@RequireRoles('FUNCIONARIO' ,'PROPRIETARIO')
@UseGuards(JwtAuthGuard, StoreAccessGuard)
@ApiTags('Delete Product Image')
@ApiBearerAuth()
export class DeleteProductImageController {
  constructor(
    private deleteProductImageService: DeleteProductImageService,
  ) {}

  @Delete()
  @HttpCode(204)
   @ApiOperation({
    summary: 'Delete product image',
    description:
      'Deletes a product image from storage. If the deleted image is the main image, another image will be selected as the new main image.',
  })

  @ApiQuery({
    name: 'newMainId',
    required: false,
    description:
      'ID of the image that should become the new main image after deletion.',
    example: 'c5dd0ce8-1415-4fe5-a8c1-2a924a4819e7',
  })

  @ApiUnauthorizedResponse({
    description:
      'Invalid authentication credentials.',
  })

  @ApiNotFoundResponse({
    description:
      'Product or image not found.',
  })
  async handle(
    @Param('productId') productId: string,
    @Param('imageId') imageId: string,

    @Query('newMainId') newMainId?: string
  ) {
    return await this.deleteProductImageService.execute(productId, imageId, newMainId);
  }
}
