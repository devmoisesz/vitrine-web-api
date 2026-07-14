import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersRepository } from '../../../database/repositories/users-repository';
import {
  InputUpdateAddressDto,
  OutputUpdateAddressDto,
} from './dto/update-address.dto';
import { AddressRepository } from '@/database/repositories/addresses-repository';

@Injectable()
export class UpdateUserAddressService {
  constructor(
    private usersRepository: UsersRepository,
    private addressRepository: AddressRepository,
  ) {}

  async execute(
    userId: string,
    addressId: string,
    data: InputUpdateAddressDto,
  ): Promise<OutputUpdateAddressDto> {
    const isUserExists = await this.usersRepository.findById(userId);

    if (!isUserExists) {
      throw new UnauthorizedException('Invalid authentication credentials.');
    }

    const address = await this.addressRepository.findById(addressId);

    if (!address) {
      throw new NotFoundException(
        'The requested resource could not be processed.',
      );
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
