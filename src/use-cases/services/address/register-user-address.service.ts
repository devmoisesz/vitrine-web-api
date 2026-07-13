import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersRepository } from '@/database/repositories/users-repository';
import { AddressRepository } from '@/database/repositories/addresses-repository';
import { InputAddressDto } from './dto/register-address.dto';

@Injectable()
export class RegisterUserAddressService {
  constructor(
    private usersRepository: UsersRepository,
    private addressRepository: AddressRepository,
  ) {}

  async execute(userId: string, data: InputAddressDto) {
    const isUserExists = await this.usersRepository.findById(userId)

    if(!isUserExists){
        throw new UnauthorizedException('Authentication required.')
    }

    return await this.addressRepository.create({
        label: data.label,
        userId: userId,
        cep: data.cep ?? null,
        state: data.state,
        city: data.city,
        neighborhood: data.neighborhood,
        street: data.street ?? null,
        number: data.number ?? null,
        complement: data.complement ?? null
    })
  }
}
