import { CurrentUser } from '@/auth/current-user-decorator';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { UserPayload } from '@/auth/jwt-payload';
import { ZodValidationPipes } from '@/http/zod/pipes/zod-validation-pipe';
import {
  type UpdateAddressBodySchema,
  updateAddressBodySchema,
} from '@/http/zod/schema/address';
import { UpdateUserAddressService } from '@/use-cases/services/address/update-user-address.service';
import {
  Body,
  Controller,
  HttpCode,
  Param,
  Put,
  UseGuards,
} from '@nestjs/common';

@Controller('/me/addressess/:addressId')
@UseGuards(JwtAuthGuard)
export class UpdateUserAddresController {
  constructor(private updateUserAddressService: UpdateUserAddressService) {}

  @Put()
  @HttpCode(204)
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
