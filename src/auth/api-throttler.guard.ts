import { ExecutionContext, Inject, Injectable, SetMetadata } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ThrottlerGuard } from '@nestjs/throttler';
import { assertTokenPayload } from './token-payload';

const USER_THROTTLE = 'throttle-by-verified-user';
export const ThrottleByUser = () => SetMetadata(USER_THROTTLE, true);

@Injectable()
export class ApiThrottlerGuard extends ThrottlerGuard {
  @Inject(JwtService)
  private readonly jwt!: JwtService;

  protected async getTracker(request: Record<string, any>, context?: ExecutionContext): Promise<string> {
    const byUser = context && this.reflector.getAllAndOverride<boolean>(USER_THROTTLE, [context.getHandler(), context.getClass()]);
    if (byUser) {
      const authorization = request.headers?.authorization;
      if (typeof authorization === 'string' && authorization.startsWith('Bearer ')) {
        try {
          const payload: unknown = await this.jwt.verifyAsync(authorization.slice(7), { algorithms: ['RS256'] });
          assertTokenPayload(payload, 'access');
          // This key only accounts for traffic. JwtAuthGuard still validates the
          // persisted session, revocation and current permissions on every call.
          return `user:${payload.sub}`;
        } catch { /* Invalid credentials share the caller's IP bucket. */ }
      }
    }
    return request.ip;
  }
}
