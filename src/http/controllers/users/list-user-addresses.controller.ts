import { CurrentUser } from '@/auth/current-user-decorator';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { UserPayload } from '@/auth/jwt-payload';
import { ZodValidationPipes } from '@/http/zod/pipes/zod-validation-pipe';
import { pageQueryParamSchema, type PageQueryParamSchema } from '@/http/zod/schema/users';
import { AddressResponseSwaggerDto } from '@/http/zod/swagger/addresses.swagger.dto';
import { ListUserAddressesService } from '@/use-cases/services/address/list-user-addresses.service';
import { Controller, Get, HttpCode, Query, Res, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery, ApiOkResponse, ApiUnauthorizedResponse } from '@nestjs/swagger';
import type { Response } from 'express';

@Controller('/me/addresses')
@UseGuards(JwtAuthGuard)
@ApiTags('List User Address')
@ApiBearerAuth()
export class ListUserAddressesController {
  constructor(private listUserAddressesService: ListUserAddressesService) {}

@Get()
@HttpCode(200)

@ApiOperation({
  summary: 'List user addresses',
  description:
    'Returns a paginated list of addresses from the authenticated user.',
})

@ApiQuery({
  name: 'page',
  required: false,
  example: 1,
  description:
    'Page number for pagination.',
})

@ApiOkResponse({
  description:
    'Addresses retrieved successfully.',
  type: AddressResponseSwaggerDto,
  isArray: true,
})

@ApiUnauthorizedResponse({
  description:
    'Invalid authentication credentials.',
})
  async handle(
    @Res({ passthrough: true }) res: Response,
    @CurrentUser() user: UserPayload,
    @Query('page', new ZodValidationPipes(pageQueryParamSchema)) page: PageQueryParamSchema
  ) {
    const userId = user.sub

    const { addresses, total } = await this.listUserAddressesService.execute(userId, page);

    res.setHeader('X-Total-Count', total.toString())

    return addresses 
  }
}