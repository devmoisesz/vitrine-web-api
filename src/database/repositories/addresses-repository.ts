import { Address, Prisma } from "@prisma/client"

export abstract class AddresssRepository {
    abstract create(data: Prisma.AddressUncheckedCreateInput): Promise<Address>
    abstract findById(id: string): Promise<Address | null>
    abstract findByUserId(userId: string): Promise<Address[]>
    abstract findByStoreId(storeId: string): Promise<Address | null>
}