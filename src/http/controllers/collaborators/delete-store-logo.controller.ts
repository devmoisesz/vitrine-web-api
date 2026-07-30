import { RequireRoles } from '@/auth/authorization/roles.decorator';
import { StoreAccessGuard } from '@/auth/authorization/store-access.guard';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { DeleteStoreLogoService } from '@/use-cases/services/stores/delete-store-logo.service';
import {
    Controller,
    Delete, HttpCode, Param, UseGuards
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiUnauthorizedResponse, ApiNotFoundResponse } from '@nestjs/swagger';

@Controller('/stores/:slug/logo/delete')
@RequireRoles('PROPRIETARIO')
@UseGuards(JwtAuthGuard, StoreAccessGuard)
@ApiTags('Delete Store Logo')
@ApiBearerAuth()
export class DeleteStoreLogoController {
  constructor(private deleteStoreLogoService: DeleteStoreLogoService) {}

  @Delete()
  @HttpCode(204)
  @ApiOperation({
    summary: 'Delete store logo',
    description:
      'Removes the current logo image from the store.',
  })

  @ApiUnauthorizedResponse({
    description:
      'Invalid authentication credentials.',
  })

  @ApiNotFoundResponse({
    description:
      'Store or logo image not found.',
  })
  async handle(@Param('slug') slug: string) {
    return await this.deleteStoreLogoService.execute(slug);
  }
}
