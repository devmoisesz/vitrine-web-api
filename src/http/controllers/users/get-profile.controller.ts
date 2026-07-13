import { CurrentUser } from '@/auth/current-user-decorator';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { UserPayload } from '@/auth/jwt-payload';
import { OutputGetProfileDto } from '@/use-cases/services/users/dtos/get-profile.dto';
import { GetProfileService } from '@/use-cases/services/users/get-profile.service';
import { Controller, Get, HttpCode, UseGuards } from '@nestjs/common';

@Controller('/me')
@UseGuards(JwtAuthGuard)
export class GetProfileController {
  constructor(private getProfileService: GetProfileService) {}

  @Get()
  @HttpCode(200)
  async handle(
    @CurrentUser() user: UserPayload
  ): Promise<OutputGetProfileDto> {
    const userId = user.sub

    return await this.getProfileService.execute({
      userId,
    });
  }
}