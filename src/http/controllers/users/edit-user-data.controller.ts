import { CurrentUser } from '@/auth/current-user-decorator';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { UserPayload } from '@/auth/jwt-payload';
import { ZodValidationPipes } from '@/http/zod/pipes/zod-validation-pipe';
import { type EditUserDataBodySchema, editUserDataBodySchema } from '@/http/zod/schema/users';
import { EditUserDataBodySwaggerDto } from '@/http/zod/swagger/users.swagger.dto';
import { EditUserDataService } from '@/use-cases/services/users/edit-user-data.service';
import { Body, Controller, HttpCode, Put, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiBody, ApiUnauthorizedResponse, ApiConflictResponse, ApiBadRequestResponse } from '@nestjs/swagger';

@Controller('/account/edit')
@UseGuards(JwtAuthGuard)
@ApiTags('Edit User Data')
@ApiBearerAuth()
export class EditUserDataController {
  constructor(private editUserDataService: EditUserDataService) {}

@Put()
@HttpCode(204)

@ApiOperation({
  summary: 'Edit user data',
  description:
    'Updates authenticated user name or email.',
})

@ApiBody({
  type: EditUserDataBodySwaggerDto,
})

@ApiUnauthorizedResponse({
  description:
    'Invalid authentication credentials.',
})

@ApiConflictResponse({
  description:
    'Unable to complete the requested operation. Email already exists.',
})

@ApiBadRequestResponse({
  description:
    'Invalid request data.',
})
  async handle(
    @Body(new ZodValidationPipes(editUserDataBodySchema))
    body: EditUserDataBodySchema,

    @CurrentUser() user: UserPayload
  ) {
    const { name, email } = body;

    const userId = user.sub

    await this.editUserDataService.execute(userId, {
      name,
      email,
    });
  }
}
