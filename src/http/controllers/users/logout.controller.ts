import { LogoutResponseSwaggerDto } from '@/http/zod/swagger/auth.swagger.dto';
import { Controller, HttpCode, Post, Req, Res } from '@nestjs/common';
import { Public } from '@/auth/public';
import { SessionService } from '@/auth/session.service';
import {
  ApiCookieAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import type { Request, Response } from 'express';

@Controller('/logout')
@Public()
@ApiTags('Logout')
@ApiCookieAuth('refreshToken')
export class LogoutController {
  constructor(private sessions: SessionService) {}
  
  @Post()
  @HttpCode(200)

  @ApiOperation({
    summary: 'Logout user',
    description: 'Revokes the session identified by the refresh cookie and clears the cookie.',
  })

  @ApiOkResponse({
    description: 'User logged out successfully.',
    type: LogoutResponseSwaggerDto,
  })

  async handle(@Req() request: Request, @Res({ passthrough: true }) res: Response) {
    await this.sessions.logout(request.cookies?.refreshToken);
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
