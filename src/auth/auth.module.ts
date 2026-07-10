import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { EnvService } from '@/env/env.service';
import { JwtStrategy } from './jwt.strategy';
import { EnvModule } from '@/env/env.module';

@Module({
  imports: [
    PassportModule,
    EnvModule,
    JwtModule.registerAsync({
      imports: [EnvModule],
      inject: [EnvService],
      global: true,
      useFactory(env: EnvService) {
        const privateKey = env.get('JWT_PRIVATE_KEY');
        const publicKey = env.get('JWT_PUBLIC_KEY');

        return {
          signOptions: { algorithm: 'RS256' },
          privateKey: Buffer.from(privateKey, 'base64'),
          publicKey: Buffer.from(publicKey, 'base64'),
        };
      },
    }),
  ],
  providers: [
    JwtStrategy,
  ],
})
export class AuthModule {}
