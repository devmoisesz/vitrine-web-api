import { Module } from "@nestjs/common";
import { PrismaService } from "./prisma/prisma.service";
import { UsersRepository } from "./repositories/users-repository";
import { PrismaUsersRepository } from "./prisma/prisma-repository/prisma-users-repository";
import { CollaboratorsRepository } from "./repositories/collaborators-repository";
import { PrismaCollaboratorsRepository } from "./prisma/prisma-repository/prisma-collaborators-repository";
import { StoresRepository } from "./repositories/stores-repository";
import { PrismaStoresRepository } from "./prisma/prisma-repository/prisma-stores-repository";

@Module({
    imports: [],
    providers: [
        PrismaService,
        {
            provide: UsersRepository,
            useClass: PrismaUsersRepository
        },
        {
            provide: CollaboratorsRepository,
            useClass: PrismaCollaboratorsRepository
        },
        {
            provide: StoresRepository,
            useClass: PrismaStoresRepository
        },
    ],
    exports: [
        PrismaService,
        UsersRepository,
        CollaboratorsRepository,
        StoresRepository
    ]
})
export class DatabaseModule {}