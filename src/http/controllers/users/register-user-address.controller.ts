import { CurrentUser } from '@/auth/current-user-decorator';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { UserPayload } from '@/auth/jwt-payload';
import { ZodValidationPipes } from '@/http/zod/pipes/zod-validation-pipe';
import {
  type RegisterAddressBodySchema,
  registerAddressBodySchema
} from '@/http/zod/schema-zod';
import { RegisterUserAddressService } from '@/use-cases/services/address/register-user-address.service';
import { Body, Controller, HttpCode, Post, UseGuards } from '@nestjs/common';

@Controller('/address/register')
@UseGuards(JwtAuthGuard)
export class RegisterUserAddressController {
  constructor(private registerUserAddressService: RegisterUserAddressService) {}

  @Post()
  @HttpCode(201)
  async handle(
    @Body(new ZodValidationPipes(registerAddressBodySchema))
    body: RegisterAddressBodySchema,

    @CurrentUser() user: UserPayload
  ) {

    const userId = user.sub

    const { label, cep, state, city, neighborhood, street, number, complement } = body

    await this.registerUserAddressService.execute(userId, {
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
