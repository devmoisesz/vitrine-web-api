import { RequireRoles } from '@/auth/authorization/roles.decorator';
import { StoreAccessGuard } from '@/auth/authorization/store-access.guard';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { DeleteStoreBannerService } from '@/use-cases/services/stores/delete-store-banner.service';
import {
    Controller,
    Delete, HttpCode, Param, UseGuards
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiUnauthorizedResponse, ApiNotFoundResponse } from '@nestjs/swagger';

@Controller('/stores/:slug/banner/delete')
@RequireRoles('PROPRIETARIO')
@UseGuards(JwtAuthGuard, StoreAccessGuard)
@ApiTags('Delete Store Banner')
@ApiBearerAuth()
export class DeleteStoreBannerController {
  constructor(private deleteStoreBannerService: DeleteStoreBannerService) {}

  @Delete()
  @HttpCode(204)
  @ApiOperation({
    summary: 'Delete store Banner',
    description:
      'Removes the current Banner image from the store.',
  })

  @ApiUnauthorizedResponse({
    description:
      'Invalid authentication credentials.',
  })

  @ApiNotFoundResponse({
    description:
      'Store or Banner image not found.',
  })
  async handle(@Param('slug') slug: string) {
    return await this.deleteStoreBannerService.execute(slug);
  }
}
