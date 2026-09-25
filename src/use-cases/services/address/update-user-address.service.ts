import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersRepository } from '../../../database/repositories/users-repository';
import {
  InputUpdateAddressDto,
  OutputUpdateAddressDto,
} from './dtos/update-address.dto';
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
    if (typeof userId !== 'string' || userId.trim().length === 0) {
      throw new UnauthorizedException('Invalid authentication credentials.');
    }

    const isUserExists = await this.usersRepository.findById(userId);

    if (!isUserExists) {
      throw new UnauthorizedException('Invalid authentication credentials.');
    }

    const address = await this.addressRepository.findByIdAndUserId(
      addressId,
      userId,
    );

    if (!address) {
      throw new NotFoundException(
        'The requested resource could not be processed.',
      );
    }

    const updatedAddress = await this.addressRepository.saveForUser(
      address.id,
      userId,
      {
        number: data.number ?? address.number,
        label: data.label ?? address.label,
        cep: data.cep ?? address.cep,
        state: data.state ?? address.state,
        city: data.city ?? address.city,
        neighborhood: data.neighborhood ?? address.neighborhood,
        street: data.street ?? address.street,
        complement: data.complement ?? address.complement,
      },
    );

    if (!updatedAddress) {
      throw new NotFoundException(
        'The requested resource could not be processed.',
      );
    }

    return updatedAddress;
  }
}
