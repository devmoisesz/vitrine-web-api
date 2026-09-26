import { Injectable, UnauthorizedException } from '@nestjs/common';
import { OAuth2Client } from 'google-auth-library';
import { UsersRepository } from '@/database/repositories/users-repository';
import { SessionService } from '@/auth/session.service';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

@Injectable()
export class GoogleAuthenticateService {
  constructor(private usersRepository: UsersRepository, private sessions: SessionService) {}

  async execute(idToken: string) {
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID, 
    });

    const payload = ticket.getPayload();

    if (!payload?.email || !payload.email_verified) {
      throw new UnauthorizedException('Invalid Google token.');
    }

    let user = await this.usersRepository.findByEmail(payload.email);

    if (!user) {
      user = await this.usersRepository.create({
        name: payload.name ?? payload.email.split('@')[0],
        email: payload.email,
        password: null,          
        provider: 'GOOGLE',
        google_id: payload.sub,  
      });
    }

    return this.sessions.create(user);
  }
}
