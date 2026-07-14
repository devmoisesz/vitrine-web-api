export abstract class InputEditDataStoreDto {
    abstract newName?: string
    abstract newEmail?: string
    abstract newDescription?: string
}

export abstract class OutputEditDataStoreDto {
    abstract name: string | null
    abstract slug: string | null
    abstract email: string | null
    abstract description: string | null
}