import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { EnvService } from '../env/env.service';
import { UserPayload } from './jwt-payload';
import { assertTokenPayload } from './token-payload';
import { SessionService } from './session.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(env: EnvService, private sessions: SessionService) {
    const publicKey = env.get('JWT_PUBLIC_KEY');

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: Buffer.from(publicKey, 'base64'),
      algorithms: ['RS256'],
    });
  }

  // O Passport injeta o retorno desse método diretamente dentro do `request.user`
  async validate(payload: unknown): Promise<UserPayload> {
    assertTokenPayload(payload, 'access');
    return this.sessions.authenticate(payload);
  }
}
