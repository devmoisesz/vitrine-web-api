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
        RegisterStoreAddressController
    ],
    providers: [
        CreateAccountService,
        AuthenticateService,
        RegisterCollaboratorService,
        RegisterStoreService,
        EnvService,
        GetProfileService,
        RegisterUserAddressService,
        RegisterStoreAddressService
    ]
})
export class HttpModule{}