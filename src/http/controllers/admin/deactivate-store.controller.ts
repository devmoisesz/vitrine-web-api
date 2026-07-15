import { AdminAccessGuard } from '@/auth/authorization/admin-access.guard';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { DeactivateStoreService } from '@/use-cases/services/stores/deactivate-store.service';
import { Controller, HttpCode, Param, Patch, UseGuards } from '@nestjs/common';

@Controller('/stores/:slug/deactivate')
@UseGuards(JwtAuthGuard, AdminAccessGuard)
export class DeactivateStoreController {
  constructor(private deactivateStoreService: DeactivateStoreService) {}

  @Patch()
  @HttpCode(204)
  async handle(
    @Param('slug') slug: string,
  ): Promise<void>{
    try {
        await this.deactivateStoreService.execute(slug);
    } catch (error) {
        console.log(error)
    }
  }
}