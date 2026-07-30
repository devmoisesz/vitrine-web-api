import { AdminAccessGuard } from '@/auth/authorization/admin-access.guard';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { ZodValidationPipes } from '@/http/zod/pipes/zod-validation-pipe';
import { registerCategoryBodySchema, type RegisterCategoryBodySchema } from '@/http/zod/schema/categories';
import { RegisterCategoryBodySwaggerDto } from '@/http/zod/swagger/categories.swagger.dto';
import { EditCategoryService } from '@/use-cases/services/products/edit-category.service';
import { Body, Controller, HttpCode, Param, Put, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiBody, ApiParam, ApiUnauthorizedResponse, ApiForbiddenResponse, ApiBadRequestResponse, ApiConflictResponse } from '@nestjs/swagger';

@Controller('/categories/:slug/edit')
@UseGuards(JwtAuthGuard, AdminAccessGuard)
@ApiTags('Edit Category')
@ApiBearerAuth()
export class EditCategoryController {
  constructor(private editCategoryService: EditCategoryService) {}

  @Put()
  @HttpCode(204)
  @ApiBody({
    type: RegisterCategoryBodySwaggerDto,
  })

  @ApiParam({
    name: 'slug',
    description: 'Category slug.',
    example: 'clothing',
  })

  @ApiUnauthorizedResponse({
    description:
      'Invalid authentication credentials.',
  })

  @ApiForbiddenResponse({
    description:
      'User does not have permission to perform this operation.',
  })

  @ApiBadRequestResponse({
    description:
      'Category not registered.',
  })

  @ApiConflictResponse({
    description:
      'Unable to complete the requested operation. Category already registered.',
  })
  async handle(
    @Body(new ZodValidationPipes(registerCategoryBodySchema))
    body: RegisterCategoryBodySchema,

    @Param('slug') slug: string
  ) {
    const { name } = body

    await this.editCategoryService.execute(slug, name);
  }
}
