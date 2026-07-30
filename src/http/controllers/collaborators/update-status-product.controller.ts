import { RequireRoles } from '@/auth/authorization/roles.decorator';
import { StoreAccessGuard } from '@/auth/authorization/store-access.guard';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { UpdateProductStatusSwaggerDto } from '@/http/zod/swagger/products.swagger.dto';
import { UpdateStatusProductService } from '@/use-cases/services/products/update-status-product.service';
import {
  Body,
  Controller,
  HttpCode,
  Param,
  ParseEnumPipe,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { ApiBadRequestResponse, ApiBearerAuth, ApiBody, ApiConflictResponse, ApiNotFoundResponse, ApiOperation, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';

enum ProductStatus {
  ATIVO = 'ATIVO',
  INATIVO = 'INATIVO'
}

@Controller('/stores/:slug/products/:productId/status')
@RequireRoles('FUNCIONARIO', 'PROPRIETARIO')
@UseGuards(JwtAuthGuard, StoreAccessGuard)
@ApiBearerAuth()
@ApiTags('Update status product')
export class UpdateStatusProductController {
  constructor(private updateStatusProductService: UpdateStatusProductService) {}

  @Patch()
  @HttpCode(204)
  @ApiOperation({
  summary: 'Update product status',
  description:
    'Changes the product availability status between active and inactive.',
})
@ApiBody({
  type: UpdateProductStatusSwaggerDto,
})
@ApiBadRequestResponse({
  description: 'Invalid product status.',
})
@ApiNotFoundResponse({
  description: 'Product not found.',
})
@ApiConflictResponse({
  description: 'Product already has this status.',
})
@ApiUnauthorizedResponse({
  description: 'Invalid authentication credentials.',
})
  async handle(
    @Param('productId') productId: string,

    @Body('status', new ParseEnumPipe(ProductStatus)) status: ProductStatus,
  ) {
    await this.updateStatusProductService.execute(productId, status);
  }
}
