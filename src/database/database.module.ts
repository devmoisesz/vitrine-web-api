import { Module } from "@nestjs/common";
import { PrismaService } from "./prisma/prisma.service";
import { UsersRepository } from "./repositories/users-repository";
import { PrismaUsersRepository } from "./prisma/prisma-repository/prisma-users-repository";

@Module({
    imports: [],
    providers: [
        PrismaService,
        {
            provide: UsersRepository,
            useClass: PrismaUsersRepository
        }
    ],
    exports: [
        PrismaService,
        UsersRepository
    ]
})
export class DatabaseModule {}