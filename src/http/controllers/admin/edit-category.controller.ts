import { AdminAccessGuard } from '@/auth/authorization/admin-access.guard';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { ZodValidationPipes } from '@/http/zod/pipes/zod-validation-pipe';
import { registerCategoryBodySchema, type RegisterCategoryBodySchema } from '@/http/zod/schema/categories';
import { EditCategoryService } from '@/use-cases/services/products/edit-category.service';
import { Body, Controller, HttpCode, Param, Put, UseGuards } from '@nestjs/common';

@Controller('/categories/:slug/edit')
@UseGuards(JwtAuthGuard, AdminAccessGuard)
export class EditCategoryController {
  constructor(private editCategoryService: EditCategoryService) {}

  @Put()
  @HttpCode(204)
  async handle(
    @Body(new ZodValidationPipes(registerCategoryBodySchema))
    body: RegisterCategoryBodySchema,

    @Param('slug') slug: string
  ) {
    const { name } = body

    await this.editCategoryService.execute(slug, name);
  }
}
