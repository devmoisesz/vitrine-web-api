import { ConflictException, Injectable } from "@nestjs/common";
import { InputCreateAccountDto, OutputCreateAccountDto } from "../dtos/create-account.dto";
import { UsersRepository } from "../../database/repositories/users-repository";
import { hash } from "bcryptjs";

@Injectable()
export class CreateAccountService {
    constructor(private usersRepositoy: UsersRepository){}

    async execute(data: InputCreateAccountDto): Promise<OutputCreateAccountDto> {
        const userWithSameEmail = await this.usersRepositoy.findByEmail(data.email)
        
        if(userWithSameEmail){
            throw new ConflictException('User already exists')
        }

        const hashedPassword = await hash(data.password, 8)

        const user = await this.usersRepositoy.create({
            name: data.name,
            email: data.email,
            password: hashedPassword
        })

        return {
            id: user.id,
            name: user.name,
            email: user.email,
            password: user.password ?? hashedPassword
        }
    }
}