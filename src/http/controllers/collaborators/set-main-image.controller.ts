import { RequireRoles } from '@/auth/authorization/roles.decorator';
import { StoreAccessGuard } from '@/auth/authorization/store-access.guard';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { SetMainImageService } from '@/use-cases/services/products/set-main-image.service';
import {
    Controller, HttpCode, Param, Patch, UseGuards
} from '@nestjs/common';

@Controller('/stores/:slug/productimages/:productId/:imageId/set-main')
@RequireRoles('FUNCIONARIO', 'PROPRIETARIO')
@UseGuards(JwtAuthGuard, StoreAccessGuard)
export class SetMainImageController {
  constructor(private setMainImageService: SetMainImageService) {}

  @Patch()
  @HttpCode(204)
  async handle(
    @Param('productId') productId: string,
    @Param('imageId') imageId: string,
  ) {
    return await this.setMainImageService.execute(
      productId,
      imageId,
    );
  }
}
