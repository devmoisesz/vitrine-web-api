import { LogoutResponseSwaggerDto } from '@/http/zod/swagger/auth.swagger.dto';
import { Controller, HttpCode, Post, Res } from '@nestjs/common';
import {
  ApiCookieAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import type { Response } from 'express';

@Controller('/logout')
@ApiTags('Logout')
@ApiCookieAuth('refreshToken')
export class LogoutController {
  
  @Post()
  @HttpCode(200)

  @ApiOperation({
    summary: 'Logout user',
    description: 'Clears the refresh token cookie and logs out the user.',
  })

  @ApiOkResponse({
    description: 'User logged out successfully.',
    type: LogoutResponseSwaggerDto,
  })

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
