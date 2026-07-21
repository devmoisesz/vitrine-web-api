import { StoresRepository } from "@/database/repositories/stores-repository";
import { Injectable } from "@nestjs/common";
import { Store } from "@prisma/client";

@Injectable()
export class ListStoresService {
    constructor(private storesRepository: StoresRepository){}

    async execute(page: number, name?: string): Promise<Store[]>{
        return await this.storesRepository.findMany(page, name)
    }
}