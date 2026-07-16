import { AdminAccessGuard } from '@/auth/authorization/admin-access.guard';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { ZodValidationPipes } from '@/http/zod/pipes/zod-validation-pipe';
import { registerCategoryBodySchema, type RegisterCategoryBodySchema } from '@/http/zod/schema/categories';
import { RegisterCategoryService } from '@/use-cases/services/products/register-category.service';
import { Body, Controller, HttpCode, Post, UseGuards } from '@nestjs/common';

@Controller('/categories')
@UseGuards(JwtAuthGuard, AdminAccessGuard)
export class RegisterCategoryController {
  constructor(private registerCategoryService: RegisterCategoryService) {}

  @Post()
  @HttpCode(201)
  async handle(
    @Body(new ZodValidationPipes(registerCategoryBodySchema))
    body: RegisterCategoryBodySchema,
  ) {
    const { name } = body

    await this.registerCategoryService.execute(name);
  }
}
