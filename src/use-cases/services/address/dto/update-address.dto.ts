export abstract class InputUpdateAddressDto {
    abstract label?: string 
    abstract cep?: string 
    abstract state?: string
    abstract city?: string
    abstract neighborhood?: string
    abstract street?: string 
    abstract number?: string  
    abstract complement?: string 
}

export abstract class OutputUpdateAddressDto {
    abstract label: string | null
    abstract cep: string | null
    abstract state: string | null
    abstract city: string | null
    abstract neighborhood: string | null
    abstract street: string | null
    abstract number: string | null
    abstract complement: string | null
}