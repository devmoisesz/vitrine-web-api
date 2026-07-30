import { CurrentUser } from '@/auth/current-user-decorator';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { UserPayload } from '@/auth/jwt-payload';
import { GetProfileResponseSwaggerDto } from '@/http/zod/swagger/users.swagger.dto';
import { OutputGetProfileDto } from '@/use-cases/services/users/dtos/get-profile.dto';
import { GetProfileService } from '@/use-cases/services/users/get-profile.service';
import { Controller, Get, HttpCode, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';

@Controller('/me')
@UseGuards(JwtAuthGuard)
@ApiTags('Get Profile')
@ApiBearerAuth()
export class GetProfileController {
  constructor(private getProfileService: GetProfileService) {}

  @Get()
  @HttpCode(200)

  @ApiOperation({
    summary: 'Get authenticated user profile',
    description:
      'Returns profile information from the currently authenticated user.',
  })

  @ApiOkResponse({
    description: 'User profile retrieved successfully.',
    type: GetProfileResponseSwaggerDto,
  })

  @ApiUnauthorizedResponse({
    description: 'Invalid authentication credentials.',
  })
  
  async handle(@CurrentUser() user: UserPayload): Promise<OutputGetProfileDto> {
    const userId = user.sub;

    return await this.getProfileService.execute({
      userId,
    });
  }
}
