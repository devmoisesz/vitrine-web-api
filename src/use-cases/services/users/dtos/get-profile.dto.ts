export abstract class InputGetProfileDto{
    abstract userId: string
}

abstract class AddressResponse {
    abstract cep: string | null
    abstract state: string
    abstract city: string
    abstract neighborhood: string
    abstract street: string | null
    abstract number: string | null 
    abstract complement: string | null
    abstract createdAt: Date
}

export abstract class OutputGetProfileDto {
    abstract user_name: string
    abstract user_email: string
    abstract user_role?: string
    abstract store_name?: string
    abstract store_address?: AddressResponse
    abstract user_address: AddressResponse[]
}