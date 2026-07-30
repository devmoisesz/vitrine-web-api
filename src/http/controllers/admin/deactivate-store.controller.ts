import { AdminAccessGuard } from '@/auth/authorization/admin-access.guard';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { DeactivateStoreService } from '@/use-cases/services/stores/deactivate-store.service';
import { Controller, HttpCode, Param, Patch, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiParam, ApiUnauthorizedResponse, ApiForbiddenResponse, ApiNotFoundResponse, ApiConflictResponse } from '@nestjs/swagger';

@Controller('/stores/:slug/deactivate')
@UseGuards(JwtAuthGuard, AdminAccessGuard)
  @ApiTags('Deactivate Store')
  @ApiBearerAuth()
export class DeactivateStoreController {
  constructor(private deactivateStoreService: DeactivateStoreService) {}

  @Patch()
  @HttpCode(204)

  @ApiOperation({
    summary: 'Deactivate store',
    description:
      'Deactivates an existing store. Only administrators can perform this operation.',
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
      'Unable to complete the requested operation. Store is already inactive.',
  })
  async handle(@Param('slug') slug: string): Promise<void> {
    await this.deactivateStoreService.execute(slug);
  }
}
