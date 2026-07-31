import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InputRegisterCollaboratorDto } from './dtos/register-collaborator.dto';
import { UsersRepository } from '@/database/repositories/users-repository';
import { CollaboratorsRepository } from '@/database/repositories/collaborators-repository';
import { hash } from 'bcryptjs';
import { StoresRepository } from '@/database/repositories/stores-repository';

@Injectable()
export class RegisterCollaboratorService {
  constructor(
    private collaboratorsRepository: CollaboratorsRepository,
    private usersRepository: UsersRepository,
    private storesRepository: StoresRepository
  ) {}

  async execute(slug: string, data: InputRegisterCollaboratorDto) {
    const store = await this.storesRepository.findBySlug(slug)

    if(!store){
      throw new NotFoundException('Resorce Not Found')
    }

    let userId: string;

    const existingUser = await this.usersRepository.findByEmail(data.email);

    if (existingUser) {
      userId = existingUser.id;

      const alreadyCollaborator =
        await this.collaboratorsRepository.findByUserId(userId);

      if (alreadyCollaborator) {
        throw new BadRequestException(
          'Unable to complete the requested operation.',
        );
      }
    } else {
      const hashedPassword = await hash(data.password, 8);

      const newUser = await this.usersRepository.create({
        name: data.name,
        email: data.email,
        password: hashedPassword,
      });
      userId = newUser.id;
    }

    return await this.collaboratorsRepository.create({
      userId: userId,
      storeId: store.id,
    });
  }
}
