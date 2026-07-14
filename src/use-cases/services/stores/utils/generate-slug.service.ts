import { StoresRepository } from "@/database/repositories/stores-repository";
import { Slug } from "@/use-cases/utils/slug";
import { Injectable } from "@nestjs/common";

@Injectable()
export class SlugGeneratorService {
    constructor(private storesRepository: StoresRepository){}

    async execute(storeName: string, currentStoreId?: string): Promise<string> {
    const baseSlug = Slug.createFromText(storeName);
    let slugCandidate = baseSlug;
    let counter = 1;

    while (true) {
      const existingStore = await this.storesRepository.findBySlug(slugCandidate);

      if (!existingStore || existingStore.id === currentStoreId) {
        return slugCandidate;
      }

      slugCandidate = `${baseSlug}-${counter}`;
      counter++;
    }
  }
}