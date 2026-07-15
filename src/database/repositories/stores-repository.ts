import { Prisma, Store } from "@prisma/client"

export abstract class StoresRepository {
    abstract create(data: Prisma.StoreUncheckedCreateInput): Promise<Store>
    abstract save(store: Store): Promise<Store>
    abstract disable(id: string, status: 'Inativa'): Promise<void>
    abstract findById(id: string): Promise<Store | null>
    abstract findBySLugAndEmail(slug: string, email: string): Promise<Store | null>
    abstract findBySlug(slug: string): Promise<Store | null>
    abstract findByWhatsapp(whatsapp: string): Promise<Store | null>
}