import { ConflictException, Injectable, UnauthorizedException } from "@nestjs/common";
import { UsersRepository } from "../../../database/repositories/users-repository";
import { InputEditUserDataDto, OutputEditUserDataDto } from "./dtos/edit-user-data.dto";

@Injectable()
export class EditUserDataService {
    constructor(
        private usersRepository: UsersRepository,
    ){}

    async execute(userId: string, data: InputEditUserDataDto): Promise<OutputEditUserDataDto> {
        const user = await this.usersRepository.findById(userId)

        if(!user){
            throw new UnauthorizedException('Authentication required.')
        }
        
        if(data.email){
            const isEmailDuplicate = await this.usersRepository.findByEmail(data.email!)

            if(isEmailDuplicate){
                throw new ConflictException('User already exists')
            }
        }

        return await this.usersRepository.save({
            id: user.id,
            name: data.name ?? user.name,
            email: data.email ?? user.email,
            password: user.password,
            role: user.role
        })
    }
}