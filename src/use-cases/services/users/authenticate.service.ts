import { BadRequestException, ConflictException, Injectable } from "@nestjs/common";
import { UsersRepository } from "../../../database/repositories/users-repository";
import { compare } from "bcryptjs";
import { User } from "@prisma/client";
import { InputAuthenticateDto } from "./dtos/authenticate.dto";

@Injectable()
export class AuthenticateService {
    constructor(private usersRepositoy: UsersRepository){}

    async execute(data: InputAuthenticateDto): Promise<User> {
        const user = await this.usersRepositoy.findByEmail(data.email)
        
        if(!user){
            throw new BadRequestException('Invalid credentials')
        }

        const doesPasswordMatches = await compare(data.password, user.password!)

        if(!doesPasswordMatches) {
            throw new BadRequestException('Invalid credentials')
        }

        return user
    }
}