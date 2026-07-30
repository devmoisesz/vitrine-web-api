import { Public } from '@/auth/public';
import { ZodValidationPipes } from '@/http/zod/pipes/zod-validation-pipe';
import {
  type CreateAccountBodySchema,
  createAccountBodySchema,
} from '@/http/zod/schema/users';
import { CreateAccountBodySwaggerDto } from '@/http/zod/swagger/users.swagger.dto';
import { CreateAccountService } from '@/use-cases/services/users/create-account.service';
import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConflictResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

@Controller('/accounts')
@Public()
@ApiTags('Create Account')
export class CreateAccountController {
  constructor(private createAccountService: CreateAccountService) {}

  @Post()
  @HttpCode(201)

  @ApiOperation({
    summary: 'Create account',
    description:
      'Creates a new user account using a unique email address and password.',
  })

  @ApiBody({
    type: CreateAccountBodySwaggerDto,
  })

  @ApiBadRequestResponse({
    description: 'Invalid request data.',
  })

  @ApiConflictResponse({
    description: 'Unable to complete the requested operation.',
  })

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
