import { Module } from '@nestjs/common';
import { ConfigModule } from "@nestjs/config";
import { envSchema } from './env/env';
import { HttpModule } from './http/http.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      validate: (env) => envSchema.parse(env),
      isGlobal: true,
      ignoreEnvFile: process.env.NODE_ENV === 'test',
    }),
    HttpModule,
    AuthModule, 
  ],
})
export class AppModule {}
