export abstract class InputAddressDto {
    abstract label?: string 
    abstract cep?: string 
    abstract state: string
    abstract city: string
    abstract neighborhood: string
    abstract street?: string 
    abstract number?: string  
    abstract complement?: string 
    abstract createdAt?: Date
}