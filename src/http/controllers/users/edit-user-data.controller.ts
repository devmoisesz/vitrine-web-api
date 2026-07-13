import { CurrentUser } from '@/auth/current-user-decorator';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { UserPayload } from '@/auth/jwt-payload';
import { ZodValidationPipes } from '@/http/zod/pipes/zod-validation-pipe';
import { type EditUserDataBodySchema, editUserDataBodySchema } from '@/http/zod/schema/users';
import { EditUserDataService } from '@/use-cases/services/users/edit-user-data.service';
import { Body, Controller, HttpCode, Put, UseGuards } from '@nestjs/common';

@Controller('/account/edit')
@UseGuards(JwtAuthGuard)
export class EditUserDataController {
  constructor(private editUserDataService: EditUserDataService) {}

  @Put()
  @HttpCode(204)
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
