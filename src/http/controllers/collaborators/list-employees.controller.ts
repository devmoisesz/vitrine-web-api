import { RequireRoles } from '@/auth/authorization/roles.decorator';
import { StoreAccessGuard } from '@/auth/authorization/store-access.guard';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { ZodValidationPipes } from '@/http/zod/pipes/zod-validation-pipe';
import { pageQueryParamSchema, type PageQueryParamSchema } from '@/http/zod/schema/users';
import { OutputListEmployee } from '@/use-cases/services/collaborators/dtos/output-list-employee.dto';
import { ListEmployeeService } from '@/use-cases/services/collaborators/list-employee.service';
import { Controller, Get, HttpCode, Param, Query, UseGuards } from '@nestjs/common';

@Controller('/store/:slug/employees')
@RequireRoles('Proprietário')
@UseGuards(JwtAuthGuard, StoreAccessGuard)
export class ListEmployeesController {
  constructor(private listEmployeesService: ListEmployeeService) {}

  @Get()
  @HttpCode(200)
  async handle(
    @Param('slug') slug: string,
    @Query('page', new ZodValidationPipes(pageQueryParamSchema)) page: PageQueryParamSchema
  ): Promise<OutputListEmployee[]> {
    return await this.listEmployeesService.execute(slug, page);
  }
}