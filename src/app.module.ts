import { Module } from '@nestjs/common';
import { ConfigModule } from "@nestjs/config";
import { envSchema } from './env/env';
import { HttpModule } from './http/http.module';
import { AuthModule } from './auth/auth.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
          ttl: 60000,
          limit: 20
      }
    ]),
    ConfigModule.forRoot({
      validate: (env) => envSchema.parse(env),
      isGlobal: true,
      ignoreEnvFile: process.env.NODE_ENV === 'test',
    }),
    HttpModule,
    AuthModule, 
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard
    }
  ]
})
export class AppModule {}
