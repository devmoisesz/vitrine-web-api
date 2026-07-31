import { CurrentUser } from '@/auth/current-user-decorator';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { UserPayload } from '@/auth/jwt-payload';
import { CartResponseSwaggerDto } from '@/http/zod/swagger/carts.swagger.dto';
import { ListCartsService } from '@/use-cases/services/cart/list-carts.service';
import { Controller, Get, HttpCode, Query, Res, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import type { Response } from 'express';

@Controller('/carts')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiTags('List Carts')
export class ListCartsController {
  constructor(private listCartsService: ListCartsService) {}

  @Get()
  @HttpCode(200)
  @ApiOperation({
    summary: 'List user carts',
    description: 'Returns all carts belonging to the authenticated user.',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    example: 1,
  })
  @ApiOkResponse({
    type: CartResponseSwaggerDto,
    isArray: true,
  })
  async handle(
    @Res({ passthrough: true }) res: Response,
    @Query('page') page: number = 1,
    @CurrentUser() user: UserPayload,
  ) {
    const userId = user.sub;

    const { carts, total } = await this.listCartsService.execute(userId, page);

    res.setHeader('X-Total-Count', total.toString())

    return carts
  }
}
