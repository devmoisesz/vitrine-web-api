import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { StoresRepository } from '@/database/repositories/stores-repository';
import { OutputStoreProfileDto } from './dtos/get-store-profile.dto';
import { AddressRepository } from '@/database/repositories/addresses-repository';

@Injectable()
export class GetStoreProfileService {
  constructor(private storesRepository: StoresRepository,
    private addressRepository: AddressRepository
  ) {}

  async execute(slug: string): Promise<OutputStoreProfileDto> {
    const store = await this.storesRepository.findBySlug(slug);

    if (!store) {
      throw new NotFoundException('Store not found.');
    }

    const storeAddress = await this.addressRepository.findByStoreId(store.id)

    return {
      name: store.name,
      description: store.description,
      logo_url: store.logo_image_url,
      whatsapp: store.whatsapp,
      address: storeAddress,
    };
  }
}
