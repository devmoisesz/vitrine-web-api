import { CurrentUser } from '@/auth/current-user-decorator';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { UserPayload } from '@/auth/jwt-payload';
import { ZodValidationPipes } from '@/http/zod/pipes/zod-validation-pipe';
import { pageQueryParamSchema, type PageQueryParamSchema } from '@/http/zod/schema/users';
import { ListUserAddressesService } from '@/use-cases/services/address/list-user-addresses.service';
import { Controller, Get, HttpCode, Query, UseGuards } from '@nestjs/common';
import { Address } from '@prisma/client';

@Controller('/me/addresses')
@UseGuards(JwtAuthGuard)
export class ListUsersAddressesController {
  constructor(private listUserAddressesService: ListUserAddressesService) {}

  @Get()
  @HttpCode(200)
  async handle(
    @CurrentUser() user: UserPayload,
    @Query('page', new ZodValidationPipes(pageQueryParamSchema)) page: PageQueryParamSchema
  ): Promise<Address[]> {
    const userId = user.sub

    return await this.listUserAddressesService.execute(userId, page);
  }
}