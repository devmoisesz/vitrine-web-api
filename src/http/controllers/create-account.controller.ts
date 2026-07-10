import { CreateAccountService } from '@/use-cases/services/users/create-account.service';
import { Body, Controller, HttpCode, Post, UsePipes } from '@nestjs/common';
import { ZodValidationPipes } from '../zod/pipes/zod-validation-pipe';
import {
  type CreateAccountBodySchema,
  createAccountBodySchema,
} from '../zod/schema-zod';

@Controller('/accounts')
export class CreateAccountController {
  constructor(private createAccountService: CreateAccountService) {}

  @Post()
  @HttpCode(201)
  @UsePipes(new ZodValidationPipes(createAccountBodySchema))
  async handle(@Body() body: CreateAccountBodySchema) {
    const { name, email, password } = body;

    return await this.createAccountService.execute({
        name, 
        email,
        password
    })
  }
}
