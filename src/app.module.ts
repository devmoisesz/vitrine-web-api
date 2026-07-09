import { Module } from '@nestjs/common';
import { ConfigModule } from "@nestjs/config";
import { envSchema } from './env/env';

@Module({
  imports: [
    ConfigModule.forRoot({
      validate: (env) => envSchema.parse(env),
      isGlobal: true
    })
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
