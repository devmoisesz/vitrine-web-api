import { StoresRepository } from "@/database/repositories/stores-repository";
import { Injectable } from "@nestjs/common";
import { Store } from "@prisma/client";

@Injectable()
export class ListStoreHomeService {
    constructor(private storesRepository: StoresRepository){}

    async execute(page: number, name?: string): Promise<{stores: Store[], total: number}>{
        return await this.storesRepository.findManyWithProducts(page, name)
    }
}