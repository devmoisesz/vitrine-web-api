import { ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AdminAccessGuard } from './admin-access.guard';

describe('Admin Access Guard', () => {
  let guard: AdminAccessGuard;

  beforeEach(() => {
    guard = new AdminAccessGuard();
  });

  // Função auxiliar para criar um ExecutionContext mockado
  function createMockContext(user: any) {
    return {
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
    } as unknown as ExecutionContext;
  }

  it('must allow access if the user is an Admin', () => {
    const context = createMockContext({ id: 'user-1', role: 'Admin' });

    const result = guard.canActivate(context);

    expect(result).toBe(true);
  });

  it('must throw UnauthorizedException if the user is not authenticated', () => {
    const context = createMockContext(undefined); 

    expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
  });

  it('must throw ForbiddenException if the user is not an Admin', () => {
    const context = createMockContext({ id: 'user-1', role: 'Usuário' });

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });
});