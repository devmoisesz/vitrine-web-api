import { AdminAccessGuard } from '@/auth/authorization/admin-access.guard';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { ZodValidationPipes } from '@/http/zod/pipes/zod-validation-pipe';
import { registerCategoryBodySchema, type RegisterCategoryBodySchema } from '@/http/zod/schema/categories';
import { RegisterCategoryBodySwaggerDto } from '@/http/zod/swagger/categories.swagger.dto';
import { RegisterSubcategoryService } from '@/use-cases/services/products/register-subcategory.service';
import { Body, Controller, HttpCode, Param, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiBody, ApiUnauthorizedResponse, ApiBadRequestResponse, ApiConflictResponse } from '@nestjs/swagger';

@Controller('/categories/:slug/subcategory')
@UseGuards(JwtAuthGuard, AdminAccessGuard)
@ApiTags('Register Subcategory')
@ApiBearerAuth()
export class RegisterSubcategoryController {
  constructor(private registersubcategoryService: RegisterSubcategoryService) {}

  @Post()
  @HttpCode(201)
  @ApiOperation({
    summary: 'Register subcategory',
    description:
      'Creates a new subcategory linked to an existing category.',
  })

  @ApiBody({
    type: RegisterCategoryBodySwaggerDto,
  })

  @ApiUnauthorizedResponse({
    description:
      'Invalid authentication credentials.',
  })

  @ApiBadRequestResponse({
    description:
      'Category not registered or invalid request data.',
  })

  @ApiConflictResponse({
    description:
      'Subcategory already registered.',
  })
  async handle(
    @Body(new ZodValidationPipes(registerCategoryBodySchema))
    body: RegisterCategoryBodySchema,

    @Param('slug') slug: string
  ) {
    const { name } = body

    await this.registersubcategoryService.execute(name, slug);
  }
}
