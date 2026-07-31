import { Public } from '@/auth/public';
import { StoreResponseSwaggerDto } from '@/http/zod/swagger/stores.swagger.dto';
import { ListStoresService } from '@/use-cases/services/stores/list-stores.service';
import { Controller, Get, HttpCode, Query, Res } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { type Response } from 'express';

@Controller('/stores')
@Public()
@ApiTags('List Stores')
export class ListStoresController {
  constructor(private listStoresService: ListStoresService) {}

  @Get()
  @HttpCode(200)
  @ApiOperation({
    summary: 'List stores',
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
    const { stores, total } = await this.listStoresService.execute(page, name);

    res.setHeader('X-Total-Count', total.toString())

    return stores
  }
}
