import { AdminAccessGuard } from '@/auth/authorization/admin-access.guard';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { StoreResponseSwaggerDto } from '@/http/zod/swagger/stores.swagger.dto';
import { ListAllStoresService } from '@/use-cases/services/stores/list-all-stores.service';
import { Controller, Get, HttpCode, Query, Res, UseGuards } from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiOkResponse,
    ApiOperation,
    ApiQuery,
    ApiTags,
} from '@nestjs/swagger';
import { type Response } from 'express';

@Controller('/stores/admin')
@UseGuards(JwtAuthGuard, AdminAccessGuard)
@ApiTags('List All Stores')
@ApiBearerAuth()
export class ListAllStoresController {
  constructor(private listAllStoresService: ListAllStoresService) {}

  @Get()
  @HttpCode(200)
  @ApiOperation({
    summary: 'List All stores',
    description:
      'Returns a paginated list of stores. Optionally filter by store name.',
  })
  @ApiQuery({
    name: 'name',
    required: false,
    description: 'Search stores by name.',
    example: 'Moda Fashion',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number for pagination.',
    example: 1,
  })
  @ApiOkResponse({
    description: 'Stores retrieved successfully.',
    type: StoreResponseSwaggerDto,
    isArray: true,
  })
  async handle(
    @Res({ passthrough: true }) res: Response,
    @Query('name') name?: string,
    @Query('page') page: number = 1,
  ) {
    const { stores, total } = await this.listAllStoresService.execute(page, name);

    res.setHeader('X-Total-Count', total.toString())

    return stores
  }
}
