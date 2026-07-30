import { RequireRoles } from '@/auth/authorization/roles.decorator';
import { StoreAccessGuard } from '@/auth/authorization/store-access.guard';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { ZodValidationPipes } from '@/http/zod/pipes/zod-validation-pipe';
import {
  updateAddressBodySchema,
  type UpdateAddressBodySchema,
} from '@/http/zod/schema/address';
import { UpdateAddressSwaggerDto } from '@/http/zod/swagger/addresses.swagger.dto';
import { UpdateStoreAddressService } from '@/use-cases/services/address/update-store-address.service';
import {
  Body,
  Controller,
  HttpCode,
  Param,
  Put,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConflictResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

@Controller('/store/:slug/address')
@RequireRoles('PROPRIETARIO')
@UseGuards(JwtAuthGuard, StoreAccessGuard)
@ApiBearerAuth()
@ApiTags('Update Store Address')
export class UpdateStoreAddresController {
  constructor(private updateStoreAddressService: UpdateStoreAddressService) {}

  @Put()
  @HttpCode(204)
  @ApiOperation({
    summary: 'Update store address',
    description: 'Updates the address information of a store.',
  })
  @ApiBody({
    type: UpdateAddressSwaggerDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid address data.',
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid authentication credentials.',
  })
  @ApiConflictResponse({
    description: 'Store address cannot be updated.',
  })
  async handle(
    @Body(new ZodValidationPipes(updateAddressBodySchema))
    body: UpdateAddressBodySchema,

    @Param('slug') slug: string,
  ) {
    const { cep, state, city, neighborhood, street, number, complement } = body;

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
