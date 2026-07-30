export interface InputRegisterCollaboratorDto {
    name: string
    email: string
    password: string
    role?: string | 'Propriétario' | 'Funcionário'
}