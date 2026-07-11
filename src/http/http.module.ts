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

@Module({
    imports: [DatabaseModule],
    controllers: [
        CreateAccountController,
        AuthenticateController,
        RegisterCollaboratorController,
        RegisterStoreController
    ],
    providers: [
        CreateAccountService,
        AuthenticateService,
        RegisterCollaboratorService,
        RegisterStoreService
    ]
})
export class HttpModule{}