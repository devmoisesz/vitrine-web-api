import { AdminAccessGuard } from '@/auth/authorization/admin-access.guard';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { ZodValidationPipes } from '@/http/zod/pipes/zod-validation-pipe';
import { registerCategoryBodySchema, type RegisterCategoryBodySchema } from '@/http/zod/schema/categories';
import { RegisterSubcategoryService } from '@/use-cases/services/products/register-subcategory.service';
import { Body, Controller, HttpCode, Param, Post, UseGuards } from '@nestjs/common';

@Controller('/categories/:slug/subcategory')
@UseGuards(JwtAuthGuard, AdminAccessGuard)
export class RegisterSubcategoryController {
  constructor(private registersubcategoryService: RegisterSubcategoryService) {}

  @Post()
  @HttpCode(201)
  async handle(
    @Body(new ZodValidationPipes(registerCategoryBodySchema))
    body: RegisterCategoryBodySchema,

    @Param('slug') slug: string
  ) {
    const { name } = body

    await this.registersubcategoryService.execute(name, slug);
  }
}
