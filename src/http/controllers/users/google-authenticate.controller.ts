import { Public } from '@/auth/public';
import { AuthenticateResponseSwaggerDto, GoogleAuthenticateSwaggerDto } from '@/http/zod/swagger/users.swagger.dto';
import { GoogleAuthenticateService } from '@/use-cases/services/users/google-authenticate.service';
import { Body, Controller, HttpCode, Post, Res } from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { z } from 'zod';

const googleAuthBodySchema = z.object({
  id_token: z.string(),
});

@Controller('/authenticate/google')
@Public()
@ApiTags('Google Authenticate')
export class GoogleAuthenticateController {
  constructor(private googleAuthenticateService: GoogleAuthenticateService) {}

  @Post()
  @HttpCode(200)
  @ApiOperation({
    summary: 'Authenticate with Google',
    description: 'Authenticate user using Google OAuth ID token.',
  })
  @ApiBody({
    type: GoogleAuthenticateSwaggerDto,
  })
  @ApiOkResponse({
    type: AuthenticateResponseSwaggerDto,
  })
  async handle(
    @Body() body: unknown,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { id_token } = googleAuthBodySchema.parse(body);

    const { access_token, refresh_token } =
      await this.googleAuthenticateService.execute(id_token);

    res.cookie('refreshToken', refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'none',
      maxAge: 1000 * 60 * 60,
      path: '/',
    });

    return { access_token, refresh_token };
  }
}
