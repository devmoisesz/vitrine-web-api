import { UnauthorizedException } from '@nestjs/common';
import type { UserPayload } from './jwt-payload';

type TokenPurpose = 'access' | 'refresh';

interface TokenPayload extends UserPayload {
  token_use: TokenPurpose;
}

export function assertTokenPayload(
  payload: unknown,
  expectedPurpose: TokenPurpose,
): asserts payload is TokenPayload {
  if (
    typeof payload !== 'object' ||
    payload === null ||
    !('token_use' in payload) ||
    payload.token_use !== expectedPurpose ||
    !('sub' in payload) ||
    typeof payload.sub !== 'string' ||
    payload.sub.trim().length === 0 ||
    !('role' in payload) ||
    (payload.role !== 'USER' && payload.role !== 'ADMIN')
  ) {
    throw new UnauthorizedException('Invalid authentication credentials.');
  }
}
