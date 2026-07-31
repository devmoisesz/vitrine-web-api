import { RequireRoles } from '@/auth/authorization/roles.decorator';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { ProductResponseSwaggerDto } from '@/http/zod/swagger/products.swagger.dto';
import { ListStoreManageProductsService } from '@/use-cases/services/products/list-store-manage-products.service';
import {
    Controller,
    Get,
    HttpCode,
    Param,
    Query,
    Res,
    UseGuards,
} from '@nestjs/common';
import {
    ApiHeader,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiParam,
    ApiQuery,
    ApiTags,
} from '@nestjs/swagger';
import { type Response } from 'express';

@Controller('/store/:slug/manage/products')
@RequireRoles('PROPRIETARIO', 'FUNCIONARIO')
@UseGuards(JwtAuthGuard)
@ApiTags('List Store Manage Products')
export class ListStoreManageProductsController {
  constructor(
    private listProductsByStoreService: ListStoreManageProductsService,
  ) {}

  @Get()
  @HttpCode(200)
  @ApiOperation({
    summary: 'List store manage products',
    description:
      'Returns all products from a specific store for management, with optional filters and pagination.',
  })
  @ApiParam({
    name: 'slug',
    example: 'minha-loja',
    description: 'Store slug',
  })
  @ApiQuery({
    name: 'name',
    required: false,
    example: 'camisa',
  })
  @ApiQuery({
    name: 'categoryId',
    required: false,
  })
  @ApiQuery({
    name: 'subcategoryId',
    required: false,
  })
  @ApiQuery({
    name: 'page',
    required: false,
    example: 1,
  })
  @ApiQuery({
    name: 'status',
    required: false,
    example: 'ATIVO',
  })
  @ApiHeader({
    name: 'X-Total-Count',
    description: 'Total number of products available',
  })
  @ApiOkResponse({
    type: ProductResponseSwaggerDto,
    isArray: true,
  })
  @ApiNotFoundResponse({
    description: 'Store not found.',
  })
  async handle(
    @Res({ passthrough: true }) res: Response,
    @Param('slug') slug: string,
    @Query('name') name?: string,
    @Query('categoryId') categoryId?: string,
    @Query('subcategoryId') subcategoryId?: string,
    @Query('status') status?: 'ATIVO' | 'INATIVO',
    @Query('page') page: number = 1,
  ) {
    const { products, total } = await this.listProductsByStoreService.execute({
      slugStore: slug,
      page,
      name,
      categoryId,
      subcategoryId,
      status,
    });

    res.setHeader('X-Total-Count', total.toString());

    return products;
  }
}
