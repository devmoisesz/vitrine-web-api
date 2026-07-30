import { Public } from '@/auth/public';
import { GoogleAuthenticateService } from '@/use-cases/services/users/google-authenticate.service';
import { Body, Controller, HttpCode, Post, Res } from '@nestjs/common';
import type { Response } from 'express';
import { z } from 'zod';

const googleAuthBodySchema = z.object({
  id_token: z.string(),
});

@Controller('/authenticate/google')
@Public()
export class GoogleAuthenticateController {
  constructor(private googleAuthenticateService: GoogleAuthenticateService) {}

  @Post()
  @HttpCode(200)
  async handle(@Body() body: unknown, @Res({ passthrough: true }) res: Response) {
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