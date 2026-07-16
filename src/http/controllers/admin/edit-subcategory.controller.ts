import { AdminAccessGuard } from '@/auth/authorization/admin-access.guard';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { ZodValidationPipes } from '@/http/zod/pipes/zod-validation-pipe';
import { registerCategoryBodySchema, type RegisterCategoryBodySchema } from '@/http/zod/schema/categories';
import { EditSubcategoryService } from '@/use-cases/services/products/edit-subcategory.service';
import { Body, Controller, HttpCode, Param, Put, UseGuards } from '@nestjs/common';

@Controller('/categories/:slug/subcategories/:id')
@UseGuards(JwtAuthGuard, AdminAccessGuard)
export class EditSubcategoryController {
  constructor(private editSubcategoryService: EditSubcategoryService) {}

  @Put()
  @HttpCode(204)
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
