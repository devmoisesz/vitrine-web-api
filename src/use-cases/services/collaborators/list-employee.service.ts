import { Injectable, NotFoundException } from '@nestjs/common';
import { StoresRepository } from '@/database/repositories/stores-repository';
import { OutputListEmployee } from './dtos/output-list-employee.dto';
import { UsersRepository } from '@/database/repositories/users-repository';

@Injectable()
export class ListEmployeeService {
  constructor(
    private usersRepository: UsersRepository,
    private storesRepository: StoresRepository,
  ) {}

  async execute(slug: string, page: number): Promise<{employees: OutputListEmployee[], total: number}> {
    const store = await this.storesRepository.findBySlug(slug);

    if (!store) {
      throw new NotFoundException('Resource Not Found.');
    }

    const users = await this.usersRepository.findEmployeesByStoreId(
      store.id,
      page
    );

    const employees = users.map((employee) => ({
      id: employee.id,
      name: employee.name,
      email: employee.email,
    }));

    const total = employees.length

    return { employees, total }
  }
}
