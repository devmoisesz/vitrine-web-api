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
import { ROLES_KEY } from './roles.decorator';

@Injectable()
export class StoreAccessGuard implements CanActivate {
  constructor(
    private prisma: PrismaService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    
    const { storeId, slug } = request.params;

    if (!user) {
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

    if (user.role === 'Admin') {
      return true;
    }

    const collaborator = await this.prisma.collaborator.findFirst({
      where: {
        userId: user.id,
        storeId: thisStoreExists.id,
      },
    });

    if (!collaborator) {
      throw new ForbiddenException('You do not have permission to perform this action.');
    }

    const requiredRoles = this.reflector.getAllAndOverride<CollaboratorRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    if (!requiredRoles.includes(collaborator.role)) {
      throw new ForbiddenException('You do not have permission to perform this action.');
    }

    return true;
  }
}