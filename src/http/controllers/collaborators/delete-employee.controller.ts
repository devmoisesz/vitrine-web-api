import { RequireRoles } from '@/auth/authorization/roles.decorator';
import { StoreAccessGuard } from '@/auth/authorization/store-access.guard';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { DeleteEmployeeService } from '@/use-cases/services/collaborators/delete-employee.service';
import { Controller, Delete, HttpCode, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiUnauthorizedResponse, ApiNotFoundResponse, ApiConflictResponse } from '@nestjs/swagger';

@Controller('/store/:slug/delete/:employeeId')
@RequireRoles('PROPRIETARIO')
@UseGuards(JwtAuthGuard, StoreAccessGuard)
@ApiTags('Delete Employee')
@ApiBearerAuth()
export class DeleteEmployeeController {
  constructor(private deleteEmployeeService: DeleteEmployeeService) {}

  @Delete()
  @HttpCode(204)
  @ApiOperation({
    summary: 'Delete employee',
    description:
      'Removes an employee from the store.',
  })

  @ApiUnauthorizedResponse({
    description:
      'Invalid authentication credentials.',
  })

  @ApiNotFoundResponse({
    description:
      'Store or employee not found.',
  })

  @ApiConflictResponse({
    description:
      'Unable to complete the requested operation. Cannot delete store owner.',
  })
  async handle(
    @Param('slug') slug: string,
    @Param('employeeId') employeeId: string,
  ) {
    await this.deleteEmployeeService.execute(slug, employeeId);
  }
}