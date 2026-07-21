export abstract class InputEditProductDto {
    abstract newNameProduct?: string
    abstract newTags?: string[]
    abstract newDescription?: string
    abstract newPrice?: number
    abstract newSizes?: string[]
    abstract newStock?: number
    abstract newCategory?: string
    abstract newSubcategory?: string
}
