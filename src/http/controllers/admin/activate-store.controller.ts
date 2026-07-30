import { AdminAccessGuard } from '@/auth/authorization/admin-access.guard';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { ActivateStoreService } from '@/use-cases/services/stores/activate-store.service';
import { Controller, HttpCode, Param, Patch, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiParam, ApiUnauthorizedResponse, ApiForbiddenResponse, ApiNotFoundResponse, ApiConflictResponse } from '@nestjs/swagger';

@Controller('/stores/:slug/activate')
@UseGuards(JwtAuthGuard, AdminAccessGuard)
@ApiTags('Activate Store')
@ApiBearerAuth()
export class ActivateStoreController {
  constructor(private activateStoreService: ActivateStoreService) {}

  @Patch()
  @HttpCode(204)
  @ApiOperation({
    summary: 'Activate store',
    description:
      'Activates an existing store. Only administrators can perform this operation.',
  })

  @ApiParam({
    name: 'slug',
    description: 'Store slug.',
    example: 'my-store',
  })

  @ApiUnauthorizedResponse({
    description:
      'Invalid authentication credentials.',
  })

  @ApiForbiddenResponse({
    description:
      'User does not have permission to perform this operation.',
  })

  @ApiNotFoundResponse({
    description:
      'The requested resource could not be processed. Store not found.',
  })

  @ApiConflictResponse({
    description:
      'Unable to complete the requested operation. Store is already active.',
  })
  
  async handle(@Param('slug') slug: string): Promise<void> {
    await this.activateStoreService.execute(slug);
  }
}
