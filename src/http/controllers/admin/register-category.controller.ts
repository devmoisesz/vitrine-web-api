import { AdminAccessGuard } from '@/auth/authorization/admin-access.guard';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { ZodValidationPipes } from '@/http/zod/pipes/zod-validation-pipe';
import { registerCategoryBodySchema, type RegisterCategoryBodySchema } from '@/http/zod/schema/categories';
import { RegisterCategoryBodySwaggerDto } from '@/http/zod/swagger/categories.swagger.dto';
import { RegisterCategoryService } from '@/use-cases/services/products/register-category.service';
import { Body, Controller, HttpCode, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiBody, ApiUnauthorizedResponse, ApiConflictResponse } from '@nestjs/swagger';

@Controller('/categories')
@UseGuards(JwtAuthGuard, AdminAccessGuard)
@ApiTags('Register Category')
@ApiBearerAuth()
export class RegisterCategoryController {
  constructor(private registerCategoryService: RegisterCategoryService) {}

  @Post()
  @HttpCode(201)
  @ApiOperation({
    summary: 'Register category',
    description:
      'Creates a new product category.',
  })

  @ApiBody({
    type: RegisterCategoryBodySwaggerDto,
  })

  @ApiUnauthorizedResponse({
    description:
      'Invalid authentication credentials.',
  })

  @ApiConflictResponse({
    description:
      'Category already registered.',
  })
  async handle(
    @Body(new ZodValidationPipes(registerCategoryBodySchema))
    body: RegisterCategoryBodySchema,
  ) {
    const { name } = body

    await this.registerCategoryService.execute(name);
  }
}
