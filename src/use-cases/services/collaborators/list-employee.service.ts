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

  async execute(slug: string, page: number): Promise<OutputListEmployee[]> {
    const store = await this.storesRepository.findBySlug(slug);

    if (!store) {
      throw new NotFoundException('Resource Not Found.');
    }

    const employees = await this.usersRepository.findEmployeesByStoreId(
      store.id,
      page
    );

    return employees.map((employee) => ({
      name: employee.name,
      email: employee.email,
    }));
  }
}
