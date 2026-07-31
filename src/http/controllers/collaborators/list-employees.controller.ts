import { RequireRoles } from '@/auth/authorization/roles.decorator';
import { StoreAccessGuard } from '@/auth/authorization/store-access.guard';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { ZodValidationPipes } from '@/http/zod/pipes/zod-validation-pipe';
import {
  pageQueryParamSchema,
  type PageQueryParamSchema,
} from '@/http/zod/schema/users';
import { ListEmployeeService } from '@/use-cases/services/collaborators/list-employee.service';
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
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiOkResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import type { Response } from 'express';

@Controller('/store/:slug/employees')
@RequireRoles('PROPRIETARIO')
@UseGuards(JwtAuthGuard, StoreAccessGuard)
@ApiTags('List Employees')
@ApiBearerAuth()
export class ListEmployeesController {
  constructor(private listEmployeesService: ListEmployeeService) {}

  @Get()
  @HttpCode(200)
  @ApiOperation({
    summary: 'List store employees',
    description:
      'Returns the employees registered in the authenticated owner store.',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number for pagination.',
    example: 1,
  })
  @ApiOkResponse({
    description: 'Employees successfully retrieved.',
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid authentication credentials.',
  })
  @ApiForbiddenResponse({
    description: 'User does not have permission to perform this action.',
  })
  @ApiNotFoundResponse({
    description: 'Store not found.',
  })
  async handle(
    @Res({ passthrough: true }) res: Response,
    @Param('slug') slug: string,
    @Query('page', new ZodValidationPipes(pageQueryParamSchema))
    page: PageQueryParamSchema,
  ) {
    const { employees, total } = await this.listEmployeesService.execute(slug, page);

    res.setHeader('X-Total-Count', total.toString());

    return employees
  }
}
