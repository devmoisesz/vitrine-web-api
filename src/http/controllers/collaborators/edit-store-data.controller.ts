import { RequireRoles } from '@/auth/authorization/roles.decorator';
import { StoreAccessGuard } from '@/auth/authorization/store-access.guard';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { ZodValidationPipes } from '@/http/zod/pipes/zod-validation-pipe';
import { type EditStoreDataBodySchema, editStoreDataBodySchema } from '@/http/zod/schema/store';
import { EditStoreDataService } from '@/use-cases/services/stores/edit-store-data.service';
import { Body, Controller, HttpCode, Param, Put, UseGuards } from '@nestjs/common';

@Controller('/store/:slug/edit')
@RequireRoles('PROPRIETARIO')
@UseGuards(JwtAuthGuard, StoreAccessGuard)
export class EditStoreDataController {
  constructor(private editStoreDataService: EditStoreDataService) {}

  @Put()
  @HttpCode(204)
  async handle(
    @Body(new ZodValidationPipes(editStoreDataBodySchema))
    body: EditStoreDataBodySchema,

    @Param('slug') slug: string
  ) {
    const { newName, newEmail, newDescription } = body;

    await this.editStoreDataService.execute(slug, {
        newName,
        newEmail,
        newDescription
    });
  }
}
