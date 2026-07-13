export abstract class InputEditUserDataDto {
    abstract name?: string
    abstract email?: string
}

export abstract class OutputEditUserDataDto {
    abstract name: string | null
    abstract email: string | null
}