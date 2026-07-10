import { Public } from '@/auth/public';
import { ZodValidationPipes } from '@/http/zod/pipes/zod-validation-pipe';
import {
  type CreateAccountBodySchema,
  createAccountBodySchema,
} from '@/http/zod/schema-zod';
import { CreateAccountService } from '@/use-cases/services/users/create-account.service';
import { Body, Controller, HttpCode, Post } from '@nestjs/common';

@Controller('/accounts')
@Public()
export class CreateAccountController {
  constructor(private createAccountService: CreateAccountService) {}

  @Post()
  @HttpCode(201)
  async handle(
    @Body(new ZodValidationPipes(createAccountBodySchema))
    body: CreateAccountBodySchema,
  ) {
    const { name, email, password } = body;

    await this.createAccountService.execute({
      name,
      email,
      password,
    });
  }
}
