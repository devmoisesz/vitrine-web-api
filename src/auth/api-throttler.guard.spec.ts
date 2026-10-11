import { Controller, Get, INestApplication } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { Throttle, ThrottlerModule } from '@nestjs/throttler';
import { generateKeyPairSync } from 'node:crypto';
import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { ApiThrottlerGuard, ThrottleByUser } from './api-throttler.guard';

@Controller()
class TrafficController {
  @Get('/me')
  @ThrottleByUser()
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  profile() { return {}; }

  @Get('/public')
  public() { return {}; }
}

describe('API throttling', () => {
  let app: INestApplication;
  let jwt: JwtService;

  beforeEach(async () => {
    const { publicKey, privateKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
    const module = await Test.createTestingModule({
      imports: [
        ThrottlerModule.forRoot([{ ttl: 60000, limit: 2 }]),
        JwtModule.register({
          privateKey: privateKey.export({ type: 'pkcs8', format: 'pem' }),
          publicKey: publicKey.export({ type: 'spki', format: 'pem' }),
          signOptions: { algorithm: 'RS256', expiresIn: '15m' },
        }),
      ],
      controllers: [TrafficController],
      providers: [{ provide: APP_GUARD, useClass: ApiThrottlerGuard }],
    }).compile();
    jwt = module.get(JwtService);
    app = module.createNestApplication();
    await app.init();
  });
  afterEach(async () => { await app?.close(); });

  const token = (jwt: JwtService, sub: string, sid = 'session') =>
    jwt.sign({ sub, sid, role: 'USER', token_use: 'access' });

  it('counts rotated access tokens together while isolating users behind the same IP', async () => {
    for (let index = 0; index < 3; index++) {
      await request(app.getHttpServer()).get('/me').auth(token(jwt, 'first', `session-${index}`), { type: 'bearer' }).expect(200);
    }
    const blocked = await request(app.getHttpServer()).get('/me').auth(token(jwt, 'first'), { type: 'bearer' }).expect(429);
    expect(Number(blocked.headers['retry-after'])).toBeGreaterThan(0);
    await request(app.getHttpServer()).get('/me').auth(token(jwt, 'second'), { type: 'bearer' }).expect(200);
  });

  it('does not trust forged tokens or refresh tokens to choose a user bucket', async () => {
    const invalid = [
      token(jwt, 'first').slice(0, -10) + 'forged',
      jwt.sign({ sub: 'second', sid: 'session', role: 'USER', token_use: 'refresh' }),
      'not-a-token',
    ];
    for (const value of invalid) {
      await request(app.getHttpServer()).get('/me').auth(value, { type: 'bearer' }).expect(200);
    }
    await request(app.getHttpServer()).get('/me').auth(token(jwt, 'third').slice(0, -10), { type: 'bearer' }).expect(429);
    await request(app.getHttpServer()).get('/me').auth(token(jwt, 'first'), { type: 'bearer' }).expect(200);
  });

  it('keeps the existing IP limit on other endpoints', async () => {
    await request(app.getHttpServer()).get('/public').expect(200);
    await request(app.getHttpServer()).get('/public').expect(200);
    await request(app.getHttpServer()).get('/public').expect(429);
  });
});
