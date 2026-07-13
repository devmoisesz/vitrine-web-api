import { BadRequestException, Injectable } from '@nestjs/common';
import { AddressRepository } from '@/database/repositories/addresses-repository';
import { InputAddressDto } from './dto/address.dto';
import { StoresRepository } from '@/database/repositories/stores-repository';

@Injectable()
export class RegisterStoreAddressService {
  constructor(
    private storesRepository: StoresRepository,
    private addressRepository: AddressRepository,
  ) {}

  async execute(slug: string, data: InputAddressDto) {
    const store = await this.storesRepository.findBySlug(slug)

    if(!store){
        throw new BadRequestException('Non-existent store')
    }

    return await this.addressRepository.create({
        label: data.label,
        storeId: store.id,
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
