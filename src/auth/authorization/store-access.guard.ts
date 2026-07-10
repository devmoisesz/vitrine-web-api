import { PrismaService } from '@/database/prisma/prisma.service';
import { BadRequestException, CanActivate, ExecutionContext, ForbiddenException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
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
      const request = context.switchToHttp().getRequest()
      const user = request.user
      const storeId = request.params.storeId

      if(!user){
        throw new UnauthorizedException('Unauthorized.')
      }

      if(!storeId) {
        throw new BadRequestException('Invalid request.')
      } 

      const thisStoreExists = await this.prisma.store.findUnique({
        where: {
          id: storeId
        }
      })

      if(!thisStoreExists){
        throw new NotFoundException('Resource not found.')
      }

      if(user.role === 'Admin') {
        return true;
      } 

      const collaborator = await this.prisma.collaborator.findFirst({
        where: {
            userId: user.id,
            storeId: storeId
        }
      })

      if (!collaborator){
        throw new ForbiddenException('You do not have permission to perform this action.')
      }

      //Lê quais papéis a rota exige
      const requiredRoles = this.reflector.getAllAndOverride<CollaboratorRole[]>(ROLES_KEY, [
        context.getHandler(),
        context.getClass()
      ])

      //Se a rota não exige um papel específico, libera o acesso caso pertence à loja)
      if(!requiredRoles || requiredRoles.length === 0){
        return true
      }

      if(!requiredRoles.includes(collaborator.role)){
        throw new ForbiddenException('You do not have permission to perform this action.')
      }

      return true
  }
}
