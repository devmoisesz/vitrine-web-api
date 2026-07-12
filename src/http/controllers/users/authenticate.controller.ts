import { ZodValidationPipes } from '@/http/zod/pipes/zod-validation-pipe';
import {
    type AuthenticateBodySchema,
    authenticateBodySchema,
} from '@/http/zod/schema-zod';
import { AuthenticateService } from '@/use-cases/services/users/authenticate.service';
import type { Response } from 'express';
import {
    Body,
    Controller,
    HttpCode,
    Post,
    Res
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Public } from '@/auth/public';

@Controller('/authenticate')
@Public()
export class AuthenticateController {
  constructor(
    private authenticateService: AuthenticateService,
    private jwt: JwtService,
  ) {}

  @Post()
  @HttpCode(200)
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

    const accessToken = this.jwt.sign(
      { role: user.role },
      { subject: user.id, expiresIn: '15m' },
    );

    const refreshToken = this.jwt.sign(
      { role: user.role },
      { subject: user.id, expiresIn: '1h' },
    );

    response.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 1000 * 60 * 60,
    });

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }
}
