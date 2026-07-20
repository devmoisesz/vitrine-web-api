import { RequireRoles } from '@/auth/authorization/roles.decorator';
import { StoreAccessGuard } from '@/auth/authorization/store-access.guard';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { DeleteProductService } from '@/use-cases/services/products/delete-product.service';
import {
    Controller, Delete, HttpCode, Param, UseGuards
} from '@nestjs/common';

@Controller('/stores/:slug/products/:productId/')
@RequireRoles('FUNCIONARIO' ,'PROPRIETARIO')
@UseGuards(JwtAuthGuard, StoreAccessGuard)
export class DeleteProductController {
  constructor(
    private deleteProductService: DeleteProductService,
  ) {}

  @Delete()
  @HttpCode(204)
  async handle(
    @Param('productId') productId: string,
  ) {
    return await this.deleteProductService.execute(productId);
  }
}
