import { CurrentUser } from '@/auth/current-user-decorator';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { UserPayload } from '@/auth/jwt-payload';
import { ZodValidationPipes } from '@/http/zod/pipes/zod-validation-pipe';
import {
  type UpdateAddressBodySchema,
  updateAddressBodySchema,
} from '@/http/zod/schema/address';
import { UpdateAddressSwaggerDto } from '@/http/zod/swagger/addresses.swagger.dto';
import { UpdateUserAddressService } from '@/use-cases/services/address/update-user-address.service';
import {
  Body,
  Controller,
  HttpCode,
  Param,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiParam, ApiBody, ApiUnauthorizedResponse, ApiNotFoundResponse, ApiBadRequestResponse } from '@nestjs/swagger';

@Controller('/me/addressess/:addressId')
@UseGuards(JwtAuthGuard)
@ApiTags('Update User Address')
@ApiBearerAuth()
export class UpdateUserAddresController {
  constructor(private updateUserAddressService: UpdateUserAddressService) {}

@Put()
@HttpCode(204)

@ApiOperation({
  summary: 'Update user address',
  description:
    'Updates an address belonging to the authenticated user.',
})

@ApiParam({
  name: 'addressId',
  description: 'Address identifier.',
  example: 'clx123abc456',
})

@ApiBody({
  type: UpdateAddressSwaggerDto,
})

@ApiUnauthorizedResponse({
  description:
    'Invalid authentication credentials.',
})

@ApiNotFoundResponse({
  description:
    'Address not found.',
})

@ApiBadRequestResponse({
  description:
    'Invalid request data.',
})
  async handle(
    @Body(new ZodValidationPipes(updateAddressBodySchema))
    body: UpdateAddressBodySchema,

    @CurrentUser() user: UserPayload,
    @Param('addressId') addressId: string,
  ) {
    const {
      label,
      cep,
      state,
      city,
      neighborhood,
      street,
      number,
      complement,
    } = body;

    const userId = user.sub;

    await this.updateUserAddressService.execute(userId, addressId, {
      label,
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
