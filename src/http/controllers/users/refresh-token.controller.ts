import { Public } from '@/auth/public';
import { EnvService } from '@/env/env.service';
import { RefreshTokenResponseSwaggerDto } from '@/http/zod/swagger/users.swagger.dto';
import {
  Controller,
  HttpCode,
  Patch,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ApiOkResponse, ApiOperation, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import type { Request, Response } from 'express';

@Controller('/refresh')
@Public()
@ApiTags('Refresh Token')
export class RefreshTokenController {
  constructor(
    private jwt: JwtService,
    private env: EnvService,
  ) {}

  @Patch()
  @HttpCode(200)
  @ApiOperation({
    summary: 'Refresh access token',
    description:
      'Generates a new access token and refresh token using a valid refresh token stored in cookies.',
  })

  @ApiOkResponse({
    description: 'Tokens refreshed successfully.',
    type: RefreshTokenResponseSwaggerDto,
  })

  @ApiUnauthorizedResponse({
    description: 'Refresh token is missing, invalid or expired.',
  })
  
  async handle(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const oldRefreshToken = request.cookies?.refreshToken;

    if (!oldRefreshToken) {
      throw new UnauthorizedException('Refresh token not found');
    }

    try {
      const publicKey = this.env.get('JWT_PUBLIC_KEY');

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
        sameSite: 'none',
        maxAge: 1000 * 60 * 60,
      });

      return {
        access_token: accessToken,
        refresh_token: newRefreshToken,
      };
    } catch (error) {
      response.clearCookie('refreshToken');
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }
}
