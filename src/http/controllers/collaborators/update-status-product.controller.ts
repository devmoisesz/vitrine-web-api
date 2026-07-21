import { RequireRoles } from '@/auth/authorization/roles.decorator';
import { StoreAccessGuard } from '@/auth/authorization/store-access.guard';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
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

enum ProductStatus {
  ATIVO = 'ATIVO',
  INATIVO = 'INATIVO'
}

@Controller('/stores/:slug/products/:productId/status')
@RequireRoles('FUNCIONARIO', 'PROPRIETARIO')
@UseGuards(JwtAuthGuard, StoreAccessGuard)
export class UpdateStatusProductController {
  constructor(private updateStatusProductService: UpdateStatusProductService) {}

  @Patch()
  @HttpCode(204)
  async handle(
    @Param('productId') productId: string,

    @Body('status', new ParseEnumPipe(ProductStatus)) status: ProductStatus,
  ) {
    await this.updateStatusProductService.execute(productId, status);
  }
}
