import { RequireRoles } from '@/auth/authorization/roles.decorator';
import { StoreAccessGuard } from '@/auth/authorization/store-access.guard';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { ZodValidationPipes } from '@/http/zod/pipes/zod-validation-pipe';
import {
    type RegisterProductBodySchema,
    registerProductBodySchema,
} from '@/http/zod/schema/products';
import { RegisterProductService } from '@/use-cases/services/products/register-product.service';
import {
    Body,
    Controller,
    HttpCode,
    Param,
    Post,
    UseGuards,
} from '@nestjs/common';

@Controller('/stores/:slug/products')
@RequireRoles('FUNCIONARIO', 'PROPRIETARIO')
@UseGuards(JwtAuthGuard, StoreAccessGuard)
export class RegisterProductController {
  constructor(
    private registerProductService: RegisterProductService,
  ) {}

  @Post()
  @HttpCode(201)
  async handle(
    @Body(new ZodValidationPipes(registerProductBodySchema))
    body: RegisterProductBodySchema,

    @Param('slug') slug: string,
  ) {
    const {
      name_product,
      tags,
      description,
      price,
      sizes,
      stock,
      name_category,
      name_subcategory,
    } = body;

    const product = await this.registerProductService.execute(slug, {
      name_product,
      tags,
      description,
      price,
      sizes,
      stock,
      name_category,
      name_subcategory,
    });

    return product.id
  }
}
