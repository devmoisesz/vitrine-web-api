import { ZodValidationPipes } from '@/http/zod/pipes/zod-validation-pipe';
import { AuthenticateService } from '@/use-cases/services/users/authenticate.service';
import type { Response } from 'express';
import { Body, Controller, HttpCode, Post, Res } from '@nestjs/common';
import { SessionService } from '@/auth/session.service';
import { Public } from '@/auth/public';
import {
  type AuthenticateBodySchema,
  authenticateBodySchema,
} from '@/http/zod/schema/users';
import {
  AuthenticateBodySwaggerDto,
  AuthenticateResponseSwaggerDto,
} from '@/http/zod/swagger/users.swagger.dto';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConflictResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';

@Controller('/authenticate')
@Public()
@ApiTags('Authentication')
export class AuthenticateController {
  constructor(
    private authenticateService: AuthenticateService,
    private sessions: SessionService,
  ) {}

  @Post()
  @HttpCode(200)

  @ApiBody({
    type: AuthenticateBodySwaggerDto,
  })

  @ApiOkResponse({
    description: 'Authentication successful.',
    type: AuthenticateResponseSwaggerDto,
  })

  @ApiBadRequestResponse({
    description: 'Invalid credentials.',
  })

  @ApiConflictResponse({
    description: 'Unable to complete the requested operation.',
  })

  async handle(
    @Body(new ZodValidationPipes(authenticateBodySchema))
    body: AuthenticateBodySchema,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { email, password } = body;

    const user = await this.authenticateService.execute({
      email,
      password,
    });

    const { access_token: accessToken, refresh_token: refreshToken } =
      await this.sessions.create(user);

    response.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'none',
      maxAge: 1000 * 60 * 60,
    });

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }
}
