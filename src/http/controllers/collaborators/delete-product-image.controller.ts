import { RequireRoles } from '@/auth/authorization/roles.decorator';
import { StoreAccessGuard } from '@/auth/authorization/store-access.guard';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { DeleteProductImageService } from '@/use-cases/services/products/delete-product-image.service';
import {
    Controller, Delete, HttpCode, Param, Query, UseGuards,
    UseInterceptors
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('/stores/:slug/productimages/:productId/:imageId')
@RequireRoles('FUNCIONARIO' ,'PROPRIETARIO')
@UseGuards(JwtAuthGuard, StoreAccessGuard)
export class DeleteProductImageController {
  constructor(
    private deleteProductImageService: DeleteProductImageService,
  ) {}

  @Delete()
  @HttpCode(204)
  @UseInterceptors(FileInterceptor("file"))
  async handle(
    @Param('productId') productId: string,
    @Param('imageId') imageId: string,

    @Query('newMainId') newMainId?: string
  ) {
    return await this.deleteProductImageService.execute(productId, imageId, newMainId);
  }
}
