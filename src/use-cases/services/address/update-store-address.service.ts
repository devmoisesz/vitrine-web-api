import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import {
  InputUpdateAddressDto,
  OutputUpdateAddressDto,
} from './dto/update-address.dto';
import { AddressRepository } from '@/database/repositories/addresses-repository';
import { StoresRepository } from '@/database/repositories/stores-repository';

@Injectable()
export class UpdateStoreAddressService {
  constructor(
    private storesRepository: StoresRepository,
    private addressRepository: AddressRepository,
  ) {}

  async execute(
    slug: string,
    data: InputUpdateAddressDto,
  ): Promise<OutputUpdateAddressDto> {
    const store = await this.storesRepository.findBySlug(slug);

    if (!store) {
      throw new UnauthorizedException('Invalid authentication credentials.');
    }

    const address = await this.addressRepository.findByStoreId(store.id);

    if (!address) {
      throw new ConflictException('Unable to process the request.');
    }

    return await this.addressRepository.save({
      number: data.number ?? address.number,
      id: address.id,
      label: data.label ?? address.label,
      userId: null,
      storeId: address.storeId ?? store.id,
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
