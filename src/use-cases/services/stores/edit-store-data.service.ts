import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { StoresRepository } from '@/database/repositories/stores-repository';
import { SlugGeneratorService } from '@/use-cases/utils/generate-slug.service';
import { EditStoreDataBodySchema } from '@/http/zod/schema/store';

@Injectable()
export class EditStoreDataService {
  constructor(
    private storesRepository: StoresRepository,
    private slugGenerator: SlugGeneratorService,
  ) {}

  async execute(slug: string, data: EditStoreDataBodySchema) {
    const store = await this.storesRepository.findBySlug(slug);

    if (!store) {
      throw new NotFoundException(
        'The requested resource could not be processed.',
      );
    }

    if (data.newWhatsapp) {
      const isWhatsappExists = await this.storesRepository.findByWhatsapp(
        data.newWhatsapp,
      );

      if(isWhatsappExists){
        throw new ConflictException('Unable to process the request.')
      }
    }

    let updatedSlug = store.slug;
    if (data.newName && data.newName != store.name) {
      updatedSlug = await this.slugGenerator.execute(data.newName, store.id);
    }

    if (data.newEmail && data.newEmail != store.email) {
      const isEmailDuplicate = await this.storesRepository.findBySLugAndEmail(
        slug,
        data.newEmail,
      );

      if (isEmailDuplicate) {
        throw new ConflictException(
          'Unable to complete the requested operation.',
        );
      }
    }

    await this.storesRepository.save({
      id: store.id,
      name: data.newName ?? store.name,
      email: data.newEmail ?? store.email,
      slug: updatedSlug,
      whatsapp: data.newWhatsapp ?? store.whatsapp,
      description: data.newDescription ?? store.description,
      cnpj: store.cnpj,
      cpf: store.cpf,
      status: store.status,
      logo_image_url: store.logo_image_url,
      logoPublicId: store.logoPublicId,
      bannerUrl: store.bannerUrl,
      bannerPublicId: store.bannerPublicId,
      payment_methods: data.newPaymentMethods ?? store.payment_methods,
      delivery_methods: data.newDeliveryMethods ?? store.delivery_methods,
      createdAt: store.createdAt,
    });
  }
}
