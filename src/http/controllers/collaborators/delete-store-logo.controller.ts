import { RequireRoles } from '@/auth/authorization/roles.decorator';
import { StoreAccessGuard } from '@/auth/authorization/store-access.guard';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { DeleteStoreLogoService } from '@/use-cases/services/stores/delete-store-logo.service';
import {
    Controller,
    Delete, HttpCode, Param, UseGuards
} from '@nestjs/common';

@Controller('/stores/:slug/logo/delete')
@RequireRoles('PROPRIETARIO')
@UseGuards(JwtAuthGuard, StoreAccessGuard)
export class DeleteStoreLogoController {
  constructor(private deleteStoreLogoService: DeleteStoreLogoService) {}

  @Delete()
  @HttpCode(204)
  async handle(@Param('slug') slug: string) {
    return await this.deleteStoreLogoService.execute(slug);
  }
}
