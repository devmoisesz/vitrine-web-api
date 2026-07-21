import { Prisma, Store } from "@prisma/client"

export abstract class StoresRepository {
    abstract create(data: Prisma.StoreUncheckedCreateInput): Promise<Store>
    abstract save(store: Store): Promise<Store>
    abstract saveImage(id: string, url: string, public_id: string): Promise<void>
    abstract disable(slug: string): Promise<void>
    abstract activate(slug: string): Promise<void>
    abstract findById(id: string): Promise<Store | null>
    abstract findMany(page: number, name?: string): Promise<Store[]>
    abstract findBySLugAndEmail(slug: string, email: string): Promise<Store | null>
    abstract findBySlug(slug: string): Promise<Store | null>
    abstract findByWhatsapp(whatsapp: string): Promise<Store | null>
}