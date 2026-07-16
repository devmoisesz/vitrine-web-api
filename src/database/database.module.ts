import { Module } from "@nestjs/common";
import { PrismaService } from "./prisma/prisma.service";
import { UsersRepository } from "./repositories/users-repository";
import { PrismaUsersRepository } from "./prisma/prisma-repository/prisma-users-repository";
import { CollaboratorsRepository } from "./repositories/collaborators-repository";
import { PrismaCollaboratorsRepository } from "./prisma/prisma-repository/prisma-collaborators-repository";
import { StoresRepository } from "./repositories/stores-repository";
import { PrismaStoresRepository } from "./prisma/prisma-repository/prisma-stores-repository";
import { AddressRepository } from "./repositories/addresses-repository";
import { PrismaAddressRepository } from "./prisma/prisma-repository/prisma-address-repository";
import { CategoriesRepository } from "./repositories/categories-repository";
import { PrismaCategoriesRepository } from "./prisma/prisma-repository/prisma-categories-repository";
import { SubcategoriesRepository } from "./repositories/subcategories-repository";
import { PrismaSubcategoriesRepository } from "./prisma/prisma-repository/prisma-subcategories-repository";

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
        {
            provide: AddressRepository,
            useClass: PrismaAddressRepository
        },
        {
            provide: CategoriesRepository,
            useClass: PrismaCategoriesRepository
        },
        {
            provide: SubcategoriesRepository,
            useClass: PrismaSubcategoriesRepository
        },
    ],
    exports: [
        PrismaService,
        UsersRepository,
        CollaboratorsRepository,
        StoresRepository,
        AddressRepository,
        CategoriesRepository,
        SubcategoriesRepository
    ]
})
export class DatabaseModule {}