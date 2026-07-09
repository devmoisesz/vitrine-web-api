export abstract class InputCreateAccountDto{
    abstract name: string
    abstract email: string
    abstract password: string
}

export abstract class OutputCreateAccountDto {
    abstract id: string
    abstract name: string
    abstract email: string
    abstract password: string
}