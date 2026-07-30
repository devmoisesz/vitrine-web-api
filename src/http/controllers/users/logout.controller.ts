import { Controller, HttpCode, Post, Res } from '@nestjs/common';
import type { Response } from 'express';

@Controller('/logout')
export class LogoutController {
  @Post()
  @HttpCode(200)
  async handle(@Res({ passthrough: true }) res: Response) {
    res.cookie('refreshToken', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', 
      sameSite: 'none',
      maxAge: 0, 
      path: '/',
    });

    return { message: 'Logout realizado com sucesso' };
  }
}
