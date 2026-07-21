import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { OutputStoreProfileDto } from '@/use-cases/services/stores/dtos/get-store-profile.dto';
import { GetStoreProfileService } from '@/use-cases/services/stores/get-store-profile.service';
import { Controller, Get, HttpCode, Param, UseGuards } from '@nestjs/common';

@Controller('/store/:slug')
@UseGuards(JwtAuthGuard)
export class GetStoreProfileController {
  constructor(private getStoreProfileService: GetStoreProfileService) {}

  @Get()
  @HttpCode(200)
  async handle(
    @Param('slug') slug: string
  ): Promise<OutputStoreProfileDto> {
    return await this.getStoreProfileService.execute(slug);
  }
}