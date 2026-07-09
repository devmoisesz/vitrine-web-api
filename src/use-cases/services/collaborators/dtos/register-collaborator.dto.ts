export abstract class InputRegisterCollaboratorDto {
    abstract name: string
    abstract email: string
    abstract password: string
    abstract role?: 'Propriétario' | 'Funcionário'
}