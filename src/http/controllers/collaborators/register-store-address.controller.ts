import { RequireRoles } from '@/auth/authorization/roles.decorator';
import { StoreAccessGuard } from '@/auth/authorization/store-access.guard';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { ZodValidationPipes } from '@/http/zod/pipes/zod-validation-pipe';
import { type RegisterAddressBodySchema, registerAddressBodySchema } from '@/http/zod/schema/address';
import { RegisterAddressBodySwaggerDto } from '@/http/zod/swagger/addresses.swagger.dto';
import { RegisterStoreAddressService } from '@/use-cases/services/address/register-store-address.service';
import { Body, Controller, HttpCode, Param, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiParam, ApiBody, ApiBadRequestResponse, ApiUnauthorizedResponse, ApiForbiddenResponse } from '@nestjs/swagger';

@Controller('/address/:slug/register/')
@RequireRoles('PROPRIETARIO')
@UseGuards(JwtAuthGuard, StoreAccessGuard)
@ApiTags('Register Store Address')
@ApiBearerAuth()
export class RegisterStoreAddressController {
  constructor(private registerStoreAddressService: RegisterStoreAddressService) {}

@Post()
@HttpCode(201)

@ApiOperation({
  summary: 'Register store address',
  description:
    'Creates a new address for a store.',
})

@ApiParam({
  name: 'slug',
  description: 'Store slug identifier.',
  example: 'minha-loja',
})

@ApiBody({
  type: RegisterAddressBodySwaggerDto,
})

@ApiBadRequestResponse({
  description:
    'Invalid address data or store not found.',
})

@ApiUnauthorizedResponse({
  description:
    'Authentication required.',
})

@ApiForbiddenResponse({
  description:
    'User does not have permission to manage this store.',
})
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
