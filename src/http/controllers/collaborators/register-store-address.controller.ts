import { RequireRoles } from '@/auth/authorization/roles.decorator';
import { StoreAccessGuard } from '@/auth/authorization/store-access.guard';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { ZodValidationPipes } from '@/http/zod/pipes/zod-validation-pipe';
import { type RegisterAddressBodySchema, registerAddressBodySchema } from '@/http/zod/schema/address';
import { RegisterStoreAddressService } from '@/use-cases/services/address/register-store-address.service';
import { Body, Controller, HttpCode, Param, Post, UseGuards } from '@nestjs/common';

@Controller('/address/:slug/register/')
@RequireRoles('Proprietário')
@UseGuards(JwtAuthGuard, StoreAccessGuard)
export class RegisterStoreAddressController {
  constructor(private registerStoreAddressService: RegisterStoreAddressService) {}

  @Post()
  @HttpCode(201)
  async handle(
    @Body(new ZodValidationPipes(registerAddressBodySchema))
    body: RegisterAddressBodySchema,

    @Param('slug') slug: string
  ) {

    const { label, cep, state, city, neighborhood, street, number, complement } = body

    await this.registerStoreAddressService.execute(slug, {
      label, 
      cep, 
      state, 
      city, 
      neighborhood, 
      street, 
      number, 
      complement
    });
  }
}
