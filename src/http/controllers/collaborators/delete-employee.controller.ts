import { RequireRoles } from '@/auth/authorization/roles.decorator';
import { StoreAccessGuard } from '@/auth/authorization/store-access.guard';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { DeleteEmployeeService } from '@/use-cases/services/collaborators/delete-employee.service';
import { Controller, Delete, HttpCode, Param, UseGuards } from '@nestjs/common';

@Controller('/store/:slug/delete/:employeeId')
@RequireRoles('PROPRIETARIO')
@UseGuards(JwtAuthGuard, StoreAccessGuard)
export class DeleteEmployeeController {
  constructor(private deleteEmployeeService: DeleteEmployeeService) {}

  @Delete()
  @HttpCode(204)
  async handle(
    @Param('slug') slug: string,
    @Param('employeeId') employeeId: string,
  ) {
    await this.deleteEmployeeService.execute(slug, employeeId);
  }
}