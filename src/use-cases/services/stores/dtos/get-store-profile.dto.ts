import { Address, Segment } from "@prisma/client"

export interface OutputStoreProfileDto {
    segments: Segment[]
    name: string
    logo_url: string | null
    banner_url: string | null
    description: string | null
    payment_methods: string[]
    delivery_methods: string[]
    whatsapp: string
    address: Address | null
}
