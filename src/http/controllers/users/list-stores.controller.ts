import { Public } from '@/auth/public';
import { ListStoresService } from '@/use-cases/services/stores/list-stores.service';
import { Controller, Get, HttpCode, Query } from '@nestjs/common';

@Controller('/stores')
@Public()
export class ListStoresController {
  constructor(private listStoresService: ListStoresService) {}

  @Get()
  @HttpCode(200)
  async handle(@Query('name') name?: string, @Query('page') page: number = 1) {
    return await this.listStoresService.execute(page, name);
  }
}
