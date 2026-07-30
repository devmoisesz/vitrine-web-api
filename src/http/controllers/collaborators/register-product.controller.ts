import { RequireRoles } from '@/auth/authorization/roles.decorator';
import { StoreAccessGuard } from '@/auth/authorization/store-access.guard';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { ZodValidationPipes } from '@/http/zod/pipes/zod-validation-pipe';
import {
  type RegisterProductBodySchema,
  registerProductBodySchema,
} from '@/http/zod/schema/products';
import { RegisterProductBodySwaggerDto } from '@/http/zod/swagger/products.swagger.dto';
import { RegisterProductService } from '@/use-cases/services/products/register-product.service';
import {
  Body,
  Controller,
  HttpCode,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

@Controller('/stores/:slug/products')
@RequireRoles('FUNCIONARIO', 'PROPRIETARIO')
@UseGuards(JwtAuthGuard, StoreAccessGuard)
@ApiTags('Register Product')
@ApiBearerAuth()
export class RegisterProductController {
  constructor(private registerProductService: RegisterProductService) {}

  @Post()
  @HttpCode(201)
  @ApiOperation({
    summary: 'Register product',
    description:
      'Creates a new product for an authenticated store employee or owner.',
  })
  @ApiBody({
    type: RegisterProductBodySwaggerDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid authentication credentials.',
  })
  @ApiForbiddenResponse({
    description: 'User does not have permission to perform this action.',
  })
  @ApiNotFoundResponse({
    description: 'Store, category or subcategory not found.',
  })
  @ApiBadRequestResponse({
    description: 'Invalid request data.',
  })
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

    return product.id;
  }
}
