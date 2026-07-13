import { Address, Prisma } from "@prisma/client"

export abstract class AddressRepository {
    abstract create(data: Prisma.AddressUncheckedCreateInput): Promise<Address>
    abstract save(address: Address): Promise<Address>
    abstract findById(id: string): Promise<Address | null>
    abstract findByUserId(userId: string): Promise<Address[]>
    abstract findByStoreId(storeId: string): Promise<Address | null>
}