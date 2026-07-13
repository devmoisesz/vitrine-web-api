import { AdminAccessGuard } from '@/auth/authorization/admin-access.guard';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { ZodValidationPipes } from '@/http/zod/pipes/zod-validation-pipe';
import {
  type RegisterStoreBodySchema,
  registerStoreBodySchema,
} from '@/http/zod/schema-zod';
import { RegisterStoreService } from '@/use-cases/services/stores/register-store.service';
import {
  Body,
  Controller,
  HttpCode, Post,
  UseGuards
} from '@nestjs/common';

@Controller('/store')
@UseGuards(JwtAuthGuard, AdminAccessGuard)
export class RegisterStoreController {
  constructor(private registerStoreService: RegisterStoreService) {}

  @Post()
  @HttpCode(201)
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
