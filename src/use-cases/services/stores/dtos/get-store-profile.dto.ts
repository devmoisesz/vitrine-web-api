import { Address } from "@prisma/client"

export abstract class OutputStoreProfileDto {
    abstract name: string
    abstract logo_url: string | null
    abstract description: string | null
    abstract whatsapp: string
    abstract address: Address | null
}