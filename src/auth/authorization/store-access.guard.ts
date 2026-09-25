import { PrismaService } from '@/database/prisma/prisma.service';
import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CollaboratorRole } from '@prisma/client';
import type { Request } from 'express';
import type { UserPayload } from '../jwt-payload';
import { ROLES_KEY } from './roles.decorator';

@Injectable()
export class StoreAccessGuard implements CanActivate {
  constructor(
    private prisma: PrismaService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<
        Request<{ storeId?: string; slug?: string }> & { user?: UserPayload }
      >();
    const user = request.user;

    const { storeId, slug } = request.params;

    if (!user || typeof user.sub !== 'string' || user.sub.trim().length === 0) {
      throw new UnauthorizedException('Unauthorized.');
    }

    if (!storeId && !slug) {
      throw new BadRequestException('Invalid request.');
    }

    const thisStoreExists = await this.prisma.store.findUnique({
      where: storeId ? { id: storeId } : { slug: slug },
    });

    if (!thisStoreExists) {
      throw new NotFoundException('Resource not found.');
    }

    if (user.role === 'ADMIN') {
      return true;
    }

    const collaborator = await this.prisma.collaborator.findFirst({
      where: {
        userId: user.sub,
        storeId: thisStoreExists.id,
      },
    });

    if (!collaborator) {
      throw new ForbiddenException(
        'You do not have permission to perform this action.',
      );
    }

    const requiredRoles = this.reflector.getAllAndOverride<CollaboratorRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    if (!requiredRoles.includes(collaborator.role)) {
      throw new ForbiddenException(
        'You do not have permission to perform this action.',
      );
    }

    return true;
  }
}
