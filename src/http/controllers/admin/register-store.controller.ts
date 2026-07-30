import { AdminAccessGuard } from '@/auth/authorization/admin-access.guard';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { ZodValidationPipes } from '@/http/zod/pipes/zod-validation-pipe';
import {
  type RegisterStoreBodySchema,
  registerStoreBodySchema,
} from '@/http/zod/schema/store';
import { RegisterStoreBodySwaggerDto } from '@/http/zod/swagger/stores.swagger.dto';
import { RegisterStoreService } from '@/use-cases/services/stores/register-store.service';
import { Body, Controller, HttpCode, Post, UseGuards } from '@nestjs/common';
import { ApiBadRequestResponse, ApiBearerAuth, ApiBody, ApiForbiddenResponse, ApiOperation, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';

@Controller('/store')
@UseGuards(JwtAuthGuard, AdminAccessGuard)
@ApiTags('Register Store')
@ApiBearerAuth()
export class RegisterStoreController {
  constructor(private registerStoreService: RegisterStoreService) {}

  @Post()
  @HttpCode(201)
  
  @ApiOperation({
  summary: 'Register store',
  description:
    'Creates a new store and assigns an owner collaborator.',
})

@ApiBody({
  type: RegisterStoreBodySwaggerDto,
})

@ApiBadRequestResponse({
  description:
    'Invalid request data, store already exists or owner was not found.',
})

@ApiUnauthorizedResponse({
  description:
    'Authentication required.',
})

@ApiForbiddenResponse({
  description:
    'User does not have permission to create a store.',
})
  async handle(
    @Body(new ZodValidationPipes(registerStoreBodySchema))
    body: RegisterStoreBodySchema,
  ) {
    const { store_name, store_email, owner_email, whatsapp } = body;

    await this.registerStoreService.execute({
      store_name,
      owner_email,
      store_email,
      whatsapp,
    });
  }
}
