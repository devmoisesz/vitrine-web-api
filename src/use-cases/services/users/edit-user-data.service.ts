import { ConflictException, Injectable, UnauthorizedException } from "@nestjs/common";
import { UsersRepository } from "../../../database/repositories/users-repository";
import { InputEditUserDataDto, OutputEditUserDataDto } from "./dtos/edit-user-data.dto";

@Injectable()
export class EditUserDataService {
    constructor(
        private usersRepositoy: UsersRepository,
    ){}

    async execute(userId: string, data: InputEditUserDataDto): Promise<OutputEditUserDataDto> {
        const user = await this.usersRepositoy.findById(userId)

        if(!user){
            throw new UnauthorizedException('Authentication required.')
        }
        
        if(data.email){
            const isEmailDuplicate = await this.usersRepositoy.findByEmail(data.email!)

            if(isEmailDuplicate){
                throw new ConflictException('User already exists')
            }
        }

        return await this.usersRepositoy.save({
            id: user.id,
            name: data.name ?? user.name,
            email: data.email ?? user.email,
            password: user.password,
            role: user.role
        })
    }
}