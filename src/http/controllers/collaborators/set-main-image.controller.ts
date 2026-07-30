import { RequireRoles } from '@/auth/authorization/roles.decorator';
import { StoreAccessGuard } from '@/auth/authorization/store-access.guard';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { SetMainImageService } from '@/use-cases/services/products/set-main-image.service';
import { Controller, HttpCode, Param, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiConflictResponse, ApiNotFoundResponse, ApiOperation, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';

@Controller('/stores/:slug/productimages/:productId/:imageId/set-main')
@RequireRoles('FUNCIONARIO', 'PROPRIETARIO')
@UseGuards(JwtAuthGuard, StoreAccessGuard)
@ApiBearerAuth()
@ApiTags('Set Main Image')
export class SetMainImageController {
  constructor(private setMainImageService: SetMainImageService) {}

  @Patch()
  @HttpCode(204)
  @ApiOperation({
    summary: 'Set product image as main',
    description:
      'Changes the main image of a product. The previous main image will be unset.',
  })
  @ApiNotFoundResponse({
    description: 'Product or image not found.',
  })
  @ApiConflictResponse({
    description: 'The selected image is already the main image.',
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid authentication credentials.',
  })
  async handle(
    @Param('productId') productId: string,
    @Param('imageId') imageId: string,
  ) {
    return await this.setMainImageService.execute(productId, imageId);
  }
}
