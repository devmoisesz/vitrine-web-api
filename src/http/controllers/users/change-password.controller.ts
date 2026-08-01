import { CurrentUser } from '@/auth/current-user-decorator';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { UserPayload } from '@/auth/jwt-payload';
import { ZodValidationPipes } from '@/http/zod/pipes/zod-validation-pipe';
import {
  changePasswordBodySchema,
  type ChangePasswordBodySchema,
} from '@/http/zod/schema/users';
import { ChangePasswordService } from '@/use-cases/services/users/change-password.service';
import { Body, Controller, HttpCode, Patch, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

@Controller('/account/password')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiTags('Change password')
export class ChangePasswordController {
  constructor(private changePasswordService: ChangePasswordService) {}

  @Patch()
  @HttpCode(204)
  @ApiOperation({
    summary: 'Change password',
    description: 'Updates the authenticated user password.',
  })
  @ApiBadRequestResponse({
    description: 'Invalid request data.',
  })
  @ApiUnauthorizedResponse({
    description:
      'Invalid authentication credentials. User not found or current password is incorrect.',
  })
  @ApiConflictResponse({
    description:
      'Unable to complete the requested operation. Password cannot be changed for Google accounts.',
  })
  async handle(
    @Body(new ZodValidationPipes(changePasswordBodySchema))
    body: ChangePasswordBodySchema,
    @CurrentUser() user: UserPayload,
  ) {
    const userId = user.sub;

    const { currentPassword, newPassword } = body;

    await this.changePasswordService.execute(userId, {
      currentPassword,
      newPassword,
    });
  }
}
