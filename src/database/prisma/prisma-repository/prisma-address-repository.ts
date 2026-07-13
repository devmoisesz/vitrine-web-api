import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import { Address, Collaborator, Prisma } from "@prisma/client";
import { AddressRepository } from "@/database/repositories/addresses-repository";

@Injectable()
export class PrismaCollaboratorsRepository implements AddressRepository {
    constructor(private readonly prisma: PrismaService){}

    async create(data: Prisma.AddressUncheckedCreateInput): Promise<Address> {
        return await this.prisma.address.create({
            data
        })
    }

    async findByUserId(id: string): Promise<Address[]> {
        const user = await this.prisma.address.findMany({
            where: {
                userId: id
            }
        })

        return user
    }

    async findByStoreId(storeId: string): Promise<Address | null> {
        const user = await this.prisma.address.findUnique({
            where: {
                storeId
            }
        })

        return user
    }
    
    async findById(id: string): Promise<Address | null> {
        const address = await this.prisma.address.findUnique({
            where: {
                id: id
            }
        })

        if(!address) return null;

        return address
    }
}