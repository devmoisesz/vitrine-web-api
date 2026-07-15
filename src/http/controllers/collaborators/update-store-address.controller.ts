import { RequireRoles } from '@/auth/authorization/roles.decorator';
import { StoreAccessGuard } from '@/auth/authorization/store-access.guard';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { ZodValidationPipes } from '@/http/zod/pipes/zod-validation-pipe';
import { updateAddressBodySchema, type UpdateAddressBodySchema } from '@/http/zod/schema/address';
import { UpdateStoreAddressService } from '@/use-cases/services/address/update-store-address.service';
import {
    Body,
    Controller,
    HttpCode,
    Param,
    Put,
    UseGuards,
} from '@nestjs/common';

@Controller('/store/:slug/address')
@RequireRoles('PROPRIETARIO')
@UseGuards(JwtAuthGuard, StoreAccessGuard)
export class UpdateStoreAddresController {
  constructor(private updateStoreAddressService: UpdateStoreAddressService) {}

  @Put()
  @HttpCode(204)
  async handle(
    @Body(new ZodValidationPipes(updateAddressBodySchema))
    body: UpdateAddressBodySchema,

    @Param('slug') slug: string,
  ) {
    const {
      cep,
      state,
      city,
      neighborhood,
      street,
      number,
      complement,
    } = body;

    await this.updateStoreAddressService.execute(slug, {
      cep,
      state,
      city,
      neighborhood,
      street,
      number,
      complement,
    });
  }
}
