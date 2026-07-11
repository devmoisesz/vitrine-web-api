import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { UsersRepository } from '@/database/repositories/users-repository';
import { CollaboratorsRepository } from '@/database/repositories/collaborators-repository';
import { InputRegisterStroreDto } from './dtos/register-store.dto';
import { StoresRepository } from '@/database/repositories/stores-repository';
import { Slug } from '@/use-cases/types/slug';

@Injectable()
export class RegisterStoreService {
  constructor(
    private collaboratorsRepository: CollaboratorsRepository,
    private usersRepository: UsersRepository,
    private storesRepository: StoresRepository,
  ) {}

  async execute(data: InputRegisterStroreDto) {
    const existingStore = await this.storesRepository.findByWhatsapp(data.whatsapp)

    if(existingStore) {
        throw new BadRequestException('Already exists')
    }

    const user = await this.usersRepository.findByEmail(data.owner_email)

    if(!user){
        throw new BadRequestException('Unregistered user')
    }

    const isCollaborator = await this.collaboratorsRepository.findByUserId(user.id)

    if(isCollaborator){
        throw new ForbiddenException('Not allowed')
    }

    const store = await this.storesRepository.create({
       name: data.store_name,
       email: data.store_email,
       slug: Slug.createFromText(data.store_name),
       whatsapp: data.whatsapp
    })

    const owner = await this.collaboratorsRepository.create({
        storeId: store.id,
        userId: user.id,
        role: 'Proprietário'
    })

    return {
        store,
        owner
    }
  }
}
