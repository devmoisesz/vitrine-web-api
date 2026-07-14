import {
    Injectable,
    UnauthorizedException
} from '@nestjs/common';
import { CollaboratorsRepository } from '@/database/repositories/collaborators-repository';
import { StoresRepository } from '@/database/repositories/stores-repository';
import { OutputListEmployee } from './dtos/output-list-employee.dto';
import { UsersRepository } from '@/database/repositories/users-repository';

@Injectable()
export class ListEmployeeService {
  constructor(
    private usersRepository: UsersRepository,
    private collaboratorsRepository: CollaboratorsRepository,
    private storesRepository: StoresRepository,
  ) {}

  async execute(slug: string, page: number): Promise<OutputListEmployee[]> {
    const store = await this.storesRepository.findBySlug(slug)

    if (!store) {
      throw new UnauthorizedException();
    }

    const employees = await this.collaboratorsRepository.findManyEmployee(store.id)

    const employeeUserId = employees.map((employee) => employee.userId)

    const users = await this.usersRepository.findManyById(employeeUserId, page)

    return users.map((user) => ({
        name: user.name,
        email: user.email
    }))
  }
}
