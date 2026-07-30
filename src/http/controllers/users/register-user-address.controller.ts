import { CurrentUser } from '@/auth/current-user-decorator';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { UserPayload } from '@/auth/jwt-payload';
import { ZodValidationPipes } from '@/http/zod/pipes/zod-validation-pipe';
import {
  type RegisterAddressBodySchema,
  registerAddressBodySchema,
} from '@/http/zod/schema/address';
import { RegisterAddressBodySwaggerDto } from '@/http/zod/swagger/addresses.swagger.dto';
import { RegisterUserAddressService } from '@/use-cases/services/address/register-user-address.service';
import { Body, Controller, HttpCode, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiBody, ApiUnauthorizedResponse, ApiBadRequestResponse } from '@nestjs/swagger';

@Controller('/address/register')
@UseGuards(JwtAuthGuard)
@ApiTags('Register User Address')
@ApiBearerAuth()
export class RegisterUserAddressController {
  constructor(private registerUserAddressService: RegisterUserAddressService) {}

  @Post()
  @HttpCode(201)
  
  @ApiOperation({
    summary: 'Register user address',
    description: 'Creates a new address for the authenticated user.',
  })

  @ApiBody({
    type: RegisterAddressBodySwaggerDto,
  })

  @ApiUnauthorizedResponse({
    description: 'Invalid authentication credentials.',
  })

  @ApiBadRequestResponse({
    description: 'Invalid address data.',
  })

  async handle(
    @Body(new ZodValidationPipes(registerAddressBodySchema))
    body: RegisterAddressBodySchema,

    @CurrentUser() user: UserPayload,
  ) {
    const userId = user.sub;

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

    await this.registerUserAddressService.execute(userId, {
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
