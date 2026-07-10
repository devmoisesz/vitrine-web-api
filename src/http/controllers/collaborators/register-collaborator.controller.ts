import { RequireRoles } from '@/auth/authorization/roles.decorator';
import { StoreAccessGuard } from '@/auth/authorization/store-access.guard';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { ZodValidationPipes } from '@/http/zod/pipes/zod-validation-pipe';
import {
  type RegisterCollaboratorBodySchema,
  registerCollaboratorBodySchema,
} from '@/http/zod/schema-zod';
import { RegisterCollaboratorService } from '@/use-cases/services/collaborators/register-collaborator.service';
import {
  Body,
  Controller,
  HttpCode,
  Param,
  Post,
  UseGuards
} from '@nestjs/common';

@Controller('/stores/:storeId/collaborators')
@RequireRoles('Proprietário')
@UseGuards(JwtAuthGuard, StoreAccessGuard)
export class RegisterCollaboratorController {
  constructor(
    private registerCollaboratorService: RegisterCollaboratorService,
  ) {}

  @Post()
  @HttpCode(201)
  async handle(
    @Body(new ZodValidationPipes(registerCollaboratorBodySchema))
    body: RegisterCollaboratorBodySchema,
    
    @Param('storeId') storeId: string,
  ) {
    const { name, email, password, role } = body;

    await this.registerCollaboratorService.execute(storeId, {
      name,
      email,
      password,
      role,
    });
  }
}
