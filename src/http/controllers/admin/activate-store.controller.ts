import { AdminAccessGuard } from '@/auth/authorization/admin-access.guard';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { ActivateStoreService } from '@/use-cases/services/stores/activate-store.service';
import { Controller, HttpCode, Param, Patch, UseGuards } from '@nestjs/common';

@Controller('/stores/:slug/activate')
@UseGuards(JwtAuthGuard, AdminAccessGuard)
export class ActivateStoreController {
  constructor(private activateStoreService: ActivateStoreService) {}

  @Patch()
  @HttpCode(204)
  async handle(@Param('slug') slug: string): Promise<void> {
    await this.activateStoreService.execute(slug);
  }
}
