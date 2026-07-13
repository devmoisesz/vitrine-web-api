import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersRepository } from '../../../database/repositories/users-repository';
import { InputUpdateAddressDto, OutputUpdateAddressDto } from './dto/update-address.dto';
import { AddressRepository } from '@/database/repositories/addresses-repository';

@Injectable()
export class UpdateUserAddresService {
  constructor(
    private usersRepositoy: UsersRepository,
    private addressRepository: AddressRepository,
) {}

  async execute(
    userId: string,
    addressId: string,
    data: InputUpdateAddressDto,
  ): Promise<OutputUpdateAddressDto> {
    const isUserExists = await this.usersRepositoy.findById(userId);

    if (!isUserExists) {
      throw new UnauthorizedException('Authentication required.');
    }

    const address = await this.addressRepository.findById(addressId);

    if(!address) {
      throw new ConflictException('Address not found.');
    }

    return await this.addressRepository.save({
      number: data.number ?? address.number,
      id: address.id,
      label: data.label ?? address.label,
      userId: address.userId ?? userId,
      storeId: null,
      cep: data.cep ?? address.cep,
      state: data.state ?? address.state,
      city: data.city ?? address.city,
      neighborhood: data.neighborhood ?? address.neighborhood,
      street: data.street ?? address.street,
      complement: data.complement ?? address.complement,
      createdAt: address.createdAt,
      updatedAt: new Date(),
    });
  }
}
