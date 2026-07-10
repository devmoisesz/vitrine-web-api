import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from "@nestjs/common";

@Injectable()
export class AdminAccessGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest()
        const user = request.user

        if(!user){
            throw new UnauthorizedException('Unauthorized.')
        }

        if(user.role !== 'Admin'){
            throw new ForbiddenException('You do not have permission to perform this action.')
        }

        return true
    }
}