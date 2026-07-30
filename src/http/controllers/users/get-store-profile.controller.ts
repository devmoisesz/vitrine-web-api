import { Public } from '@/auth/public';
import { GetStoreProfileService } from '@/use-cases/services/stores/get-store-profile.service';
import { Controller, Get, HttpCode, Param } from '@nestjs/common';

@Controller('/store/:slug')
@Public()
export class GetStoreProfileController {
  constructor(private getStoreProfileService: GetStoreProfileService) {}

  @Get()
  @HttpCode(200)
  async handle(
    @Param('slug') slug: string
  ) {
    return await this.getStoreProfileService.execute(slug);
  }
}