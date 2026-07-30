import { RequireRoles } from '@/auth/authorization/roles.decorator';
import { StoreAccessGuard } from '@/auth/authorization/store-access.guard';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { ZodValidationPipes } from '@/http/zod/pipes/zod-validation-pipe';
import { type RegisterCollaboratorBodySchema, registerCollaboratorBodySchema } from '@/http/zod/schema/collaborators';
import { RegisterCollaboratorBodySwaggerDto } from '@/http/zod/swagger/collaborators.swagger.dto';
import { RegisterCollaboratorService } from '@/use-cases/services/collaborators/register-collaborator.service';
import {
  Body,
  Controller,
  HttpCode,
  Param,
  Post,
  UseGuards
} from '@nestjs/common';
import { ApiBadRequestResponse, ApiBearerAuth, ApiBody, ApiForbiddenResponse, ApiNotFoundResponse, ApiOperation, ApiParam, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';

@Controller('/stores/:storeId/collaborators')
@RequireRoles('PROPRIETARIO')
@UseGuards(JwtAuthGuard, StoreAccessGuard)
@ApiTags('Register Collaborator')
@ApiBearerAuth()
export class RegisterCollaboratorController {
  constructor(
    private registerCollaboratorService: RegisterCollaboratorService,
  ) {}

  @Post()
  @HttpCode(201)
  
  @ApiOperation({
  summary: 'Register collaborator',
  description:
    'Creates a new collaborator for a store.',
})

@ApiParam({
  name: 'storeId',
  description: 'Store unique identifier.',
  example: 'clx123456789',
})

@ApiBody({
  type: RegisterCollaboratorBodySwaggerDto,
})

@ApiBadRequestResponse({
  description: 'Invalid request data or collaborator already exists.',
})

@ApiUnauthorizedResponse({
  description: 'Authentication required.',
})

@ApiForbiddenResponse({
  description: 'User does not have permission to manage this store.',
})

@ApiNotFoundResponse({
  description: 'Store not found.',
})
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
