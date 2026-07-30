import { RequireRoles } from '@/auth/authorization/roles.decorator';
import { StoreAccessGuard } from '@/auth/authorization/store-access.guard';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { ZodValidationPipes } from '@/http/zod/pipes/zod-validation-pipe';
import { type EditStoreDataBodySchema, editStoreDataBodySchema } from '@/http/zod/schema/store';
import { EditStoreDataBodySwaggerDto } from '@/http/zod/swagger/stores.swagger.dto';
import { EditStoreDataService } from '@/use-cases/services/stores/edit-store-data.service';
import { Body, Controller, HttpCode, Param, Put, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiBody, ApiUnauthorizedResponse, ApiForbiddenResponse, ApiNotFoundResponse, ApiConflictResponse } from '@nestjs/swagger';

@Controller('/store/:slug/edit')
@RequireRoles('PROPRIETARIO')
@UseGuards(JwtAuthGuard, StoreAccessGuard)
@ApiTags('Edit Store Data')
@ApiBearerAuth()
export class EditStoreDataController {
  constructor(private editStoreDataService: EditStoreDataService) {}

  @Put()
  @HttpCode(204)
  @ApiOperation({
    summary: 'Edit store data',
    description:
      'Updates authenticated store owner store information.',
  })

  @ApiBody({
    type: EditStoreDataBodySwaggerDto,
  })

  @ApiUnauthorizedResponse({
    description:
      'Invalid authentication credentials.',
  })

  @ApiForbiddenResponse({
    description:
      'User does not have permission to perform this action.',
  })

  @ApiNotFoundResponse({
    description:
      'Store not found.',
  })

  @ApiConflictResponse({
    description:
      'Unable to complete the requested operation. Email already exists.',
  })
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
