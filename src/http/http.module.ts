import { DatabaseModule } from "@/database/database.module";
import { Module } from "@nestjs/common";
import { CreateAccountService } from "@/use-cases/services/users/create-account.service";
import { CreateAccountController } from "./controllers/users/create-account.controller";
import { AuthenticateController } from "./controllers/users/authenticate.controller";
import { AuthenticateService } from "@/use-cases/services/users/authenticate.service";
import { RegisterCollaboratorService } from "@/use-cases/services/collaborators/register-collaborator.service";
import { RegisterCollaboratorController } from "./controllers/collaborators/register-collaborator.controller";
import { RegisterStoreController } from "./controllers/admin/register-store.controller";
import { RegisterStoreService } from "@/use-cases/services/stores/register-store.service";
import { RefreshTokenController } from "./controllers/users/refresh-token.controller";
import { EnvService } from "@/env/env.service";
import { GetProfileService } from "@/use-cases/services/users/get-profile.service";
import { GetProfileController } from "./controllers/users/get-profile.controller";
import { RegisterUserAddressController } from "./controllers/users/register-user-address.controller";
import { RegisterUserAddressService } from "@/use-cases/services/address/register-user-address.service";
import { RegisterStoreAddressController } from "./controllers/collaborators/register-store-address.controller";
import { RegisterStoreAddressService } from "@/use-cases/services/address/register-store-address.service";
import { EditUserDataController } from "./controllers/users/edit-user-data.controller";
import { EditUserDataService } from "@/use-cases/services/users/edit-user-data.service";
import { UpdateUserAddresController } from "./controllers/users/update-user-address.controller";
import { UpdateUserAddressService } from "@/use-cases/services/address/update-user-address.service";
import { ListUsersAddressesController } from "./controllers/users/list-users-addresses.controller";
import { ListUserAddressesService } from "@/use-cases/services/address/list-user-addresses.service";
import { SlugGeneratorService } from "@/use-cases/services/stores/utils/generate-slug.service";
import { EditStoreDataController } from "./controllers/collaborators/edit-store-data.controller";
import { EditStoreDataService } from "@/use-cases/services/stores/edit-store-data.service";

@Module({
    imports: [DatabaseModule],
    controllers: [
        CreateAccountController,
        AuthenticateController,
        RegisterCollaboratorController,
        RegisterStoreController,
        RefreshTokenController,
        GetProfileController,
        RegisterUserAddressController,
        RegisterStoreAddressController,
        EditUserDataController,
        UpdateUserAddresController,
        ListUsersAddressesController,
        EditStoreDataController
    ],
    providers: [
        CreateAccountService,
        AuthenticateService,
        RegisterCollaboratorService,
        RegisterStoreService,
        EnvService,
        GetProfileService,
        RegisterUserAddressService,
        RegisterStoreAddressService,
        EditUserDataService,
        UpdateUserAddressService,
        ListUserAddressesService,
        SlugGeneratorService,
        EditStoreDataService
    ]
})
export class HttpModule{}