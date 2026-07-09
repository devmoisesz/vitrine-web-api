import { BadRequestException, Injectable } from '@nestjs/common';
import { InputRegisterCollaboratorDto } from './dtos/register-collaborator.dto';
import { UsersRepository } from '@/database/repositories/users-repository';
import { CollaboratorsRepository } from '@/database/repositories/collaborators-repository';
import { hash } from 'bcryptjs';

@Injectable()
export class RegisterCollaboratorService {
  constructor(
    private collaboratorsRepository: CollaboratorsRepository,
    private usersRepository: UsersRepository,
  ) {}

  async execute(storeId: string, data: InputRegisterCollaboratorDto) {
    let userId: string;

    const existingUser = await this.usersRepository.findByEmail(data.email);

    if (existingUser) {
      userId = existingUser.id;

      const alreadyCollaborator = await this.collaboratorsRepository.findByUserId(userId);

      if (alreadyCollaborator) {
        throw new BadRequestException(
          'This user is already a collaborator for a store and cannot be linked to another.',
        );
      }
    } else {
      const hashedPassword = await hash(data.password, 8);

      const newUser = await this.usersRepository.create({
        name: data.name,
        email: data.email,
        password: hashedPassword,
      });
      userId = newUser.id
    }

    return await this.collaboratorsRepository.create({
        userId: userId,
        storeId: storeId
    })
  }
}
