import { AdminAccessGuard } from '@/auth/authorization/admin-access.guard';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { ZodValidationPipes } from '@/http/zod/pipes/zod-validation-pipe';
import { registerCategoryBodySchema, type RegisterCategoryBodySchema } from '@/http/zod/schema/categories';
import { RegisterCategoryBodySwaggerDto } from '@/http/zod/swagger/categories.swagger.dto';
import { EditSubcategoryService } from '@/use-cases/services/products/edit-subcategory.service';
import { Body, Controller, HttpCode, Param, Put, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiBody, ApiParam, ApiUnauthorizedResponse, ApiForbiddenResponse, ApiNotFoundResponse, ApiBadRequestResponse, ApiConflictResponse } from '@nestjs/swagger';

@Controller('/categories/:slug/subcategories/:id')
@UseGuards(JwtAuthGuard, AdminAccessGuard)
@ApiTags('Edit Sucategory')
@ApiBearerAuth()
export class EditSubcategoryController {
  constructor(private editSubcategoryService: EditSubcategoryService) {}

  @Put()
  @HttpCode(204)
  @ApiOperation({
    summary: 'Edit subcategory',
    description:
      'Updates an existing product subcategory. Only administrators can perform this operation.',
  })

  @ApiBody({
    type: RegisterCategoryBodySwaggerDto,
  })

  @ApiParam({
    name: 'slug',
    description: 'Category slug.',
    example: 'clothing',
  })

  @ApiParam({
    name: 'id',
    description: 'Subcategory ID.',
    example: '9f2b7c9e-4d5a-4c1a-8b7e-123456789abc',
  })

  @ApiUnauthorizedResponse({
    description:
      'Invalid authentication credentials.',
  })

  @ApiForbiddenResponse({
    description:
      'User does not have permission to perform this operation.',
  })

  @ApiNotFoundResponse({
    description:
      'Category not found.',
  })

  @ApiBadRequestResponse({
    description:
      'Subcategory not registered.',
  })

  @ApiConflictResponse({
    description:
      'Unable to complete the requested operation. Subcategory already registered.',
  })
  async handle(
    @Body(new ZodValidationPipes(registerCategoryBodySchema))
    body: RegisterCategoryBodySchema,

    @Param('slug') slug: string,
    @Param('id') id: string
  ) {
    const { name } = body

    await this.editSubcategoryService.execute(slug, id, name);
  }
}
