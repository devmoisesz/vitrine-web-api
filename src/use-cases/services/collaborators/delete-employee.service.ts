import {
    ConflictException,
    Injectable,
    NotFoundException
} from '@nestjs/common';
import { CollaboratorsRepository } from '@/database/repositories/collaborators-repository';
import { StoresRepository } from '@/database/repositories/stores-repository';

@Injectable()
export class DeleteEmployeeService {
  constructor(
    private collaboratorsRepository: CollaboratorsRepository,
    private storesRepository: StoresRepository,
  ) {}

  async execute(storeSlug: string, employeeId: string) {

    const store = await this.storesRepository.findBySlug(storeSlug);

    if (!store) {
      throw new NotFoundException(
        'The requested resource could not be processed.',
      );
    }

    const employee = await this.collaboratorsRepository.findById(employeeId);

    if (!employee) {
      throw new NotFoundException(
        'The requested resource could not be processed.',
      );
    }

    if (employee.role === 'PROPRIETARIO') {
      throw new ConflictException(
        'Unable to complete the requested operation.',
      );
    }

    await this.collaboratorsRepository.delete(employee.id);
  }
}
