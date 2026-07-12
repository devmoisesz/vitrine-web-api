import { Public } from '@/auth/public';
import { EnvService } from '@/env/env.service';
import {
    Controller,
    HttpCode,
    Patch, Req,
    Res,
    UnauthorizedException
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Request, Response } from 'express';

@Controller('/refresh')
@Public()
export class RefreshTokenController {
  constructor(
    private jwt: JwtService,
    private env: EnvService
  ) {}

  @Patch()
  @HttpCode(200)
  async handle(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const oldRefreshToken = request.cookies?.refreshToken;

    if (!oldRefreshToken) {
      throw new UnauthorizedException('Refresh token not found');
    }

    try {
        const publicKey = this.env.get('JWT_PUBLIC_KEY')
    
      const payload = await this.jwt.verifyAsync(oldRefreshToken, {
        publicKey: Buffer.from(publicKey!, 'base64'),
      });

      const accessToken = this.jwt.sign(
        { role: payload.role },
        { subject: payload.sub, expiresIn: '15m' },
      );

      const newRefreshToken = this.jwt.sign(
        { role: payload.role },
        { subject: payload.sub, expiresIn: '1h' },
      );

      response.cookie('refreshToken', newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 1000 * 60 * 60
      })

      return {
        access_token: accessToken,
        refresh_token: newRefreshToken
      }
    } catch (error) {
        response.clearCookie('refreshToken')
        throw new UnauthorizedException('Invalid or expired refresh token')
    }
  }
}
