import { RequireRoles } from '@/auth/authorization/roles.decorator';
import { StoreAccessGuard } from '@/auth/authorization/store-access.guard';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { ListStoreOrdersService } from '@/use-cases/services/order/list-store-orders.service';
import {
  Controller,
  Get,
  HttpCode,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';

@Controller('/store/:slug/orders')
@RequireRoles('FUNCIONARIO', 'PROPRIETARIO')
@UseGuards(JwtAuthGuard, StoreAccessGuard)
@ApiTags('List Store Orders')
@ApiBearerAuth()
export class ListStoreOrdersController {
  constructor(private listStoreOrdersService: ListStoreOrdersService) {}

  @Get()
  @HttpCode(200)
  @ApiOperation({
    summary: 'List store orders',
    description:
      'Returns all orders from an authenticated store employee or owner.',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number for pagination.',
    example: 1,
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid authentication credentials.',
  })
  @ApiForbiddenResponse({
    description: 'User does not have permission to perform this action.',
  })
  @ApiNotFoundResponse({
    description: 'Store not found.',
  })
  async handle(@Param('slug') slug: string, @Query('page') page: number = 1) {
    return await this.listStoreOrdersService.execute(slug, page);
  }
}
