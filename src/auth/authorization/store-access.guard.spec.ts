import { ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { StoreAccessGuard } from './store-access.guard';
import type { PrismaService } from '@/database/prisma/prisma.service'; // Ajuste o caminho se necessário

describe('StoreAccessGuard', () => {
  let guard: StoreAccessGuard;

  // objetos de mock com todas as propriedades necessárias
  const prismaMock = {
    store: {
      findUnique: vi.fn(),
    },
    collaborator: {
      findFirst: vi.fn(),
    },
  };

  const reflectorMock = {
    getAllAndOverride: vi.fn(),
  };

  beforeEach(() => {
    // Limpa o histórico de chamadas dos mocks antes de cada teste
    vi.clearAllMocks();

    guard = new StoreAccessGuard(
      prismaMock as unknown as PrismaService,
      reflectorMock as unknown as Reflector,
    );

    // na maioria dos testes, a loja existe
    prismaMock.store.findUnique.mockResolvedValue({ id: 'store-id', name: 'Loja Teste' });
  });

  function createMockContext(user: any, storeId: string) {
    return {
      switchToHttp: () => ({
        getRequest: () => ({
          user,
          params: { storeId },
        }),
      }),
      getHandler: () => ({}),
      getClass: () => ({}),
    } as unknown as ExecutionContext;
  }

  it('must allow direct access if the user is a Global Admin', async () => {
    const context = createMockContext({ id: 'admin-id', role: 'ADMIN' }, 'store-id');

    const result = await guard.canActivate(context);

    expect(result).toBe(true);
   
    expect(prismaMock.collaborator.findFirst).not.toHaveBeenCalled();
  });

  it('must throw UnauthorizedException if there is no user in the request', async () => {
    const context = createMockContext(undefined, 'store-id');

    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
  });

  it('must throw ForbiddenException if the user is not a store collaborator', async () => {
    const context = createMockContext({ id: 'user-id', role: 'Usuário' }, 'store-id');
    
    prismaMock.collaborator.findFirst.mockResolvedValue(null);

    await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
  });

  it('must allow access if the user belongs to the store and the route does not require specific roles', async () => {
    const context = createMockContext({ id: 'user-id', role: 'Usuário' }, 'store-id');
    
    prismaMock.collaborator.findFirst.mockResolvedValue({ id: 'collab-id', role: 'Funcionário' });
    reflectorMock.getAllAndOverride.mockReturnValue(undefined); 

    const result = await guard.canActivate(context);

    expect(result).toBe(true);
  });

  it('must throw ForbiddenException if the collaborator does not have the role required by the route', async () => {
    const context = createMockContext({ id: 'user-id', role: 'Usuário' }, 'store-id');
    
    prismaMock.collaborator.findFirst.mockResolvedValue({ id: 'collab-id', role: 'Funcionário' });
    reflectorMock.getAllAndOverride.mockReturnValue(['Proprietário']); 

    await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
  });

  it('must allow access if the user holds the role required by the route.', async () => {
    const context = createMockContext({ id: 'user-id', role: 'Usuário' }, 'store-id');
    
    prismaMock.collaborator.findFirst.mockResolvedValue({ id: 'collab-id', role: 'Proprietário' });
    reflectorMock.getAllAndOverride.mockReturnValue(['Proprietário']); 

    const result = await guard.canActivate(context);

    expect(result).toBe(true);
  });
});