import { DatabaseModule } from "@/database/database.module";
import { Module } from "@nestjs/common";
import { CreateAccountService } from "@/use-cases/services/users/create-account.service";
import { CreateAccountController } from "./controllers/users/create-account.controller";
import { AuthenticateController } from "./controllers/users/authenticate.controller";
import { AuthenticateService } from "@/use-cases/services/users/authenticate.service";
import { RegisterCollaboratorController } from "./controllers/users/register-collaborator.controller";
import { RegisterCollaboratorService } from "@/use-cases/services/collaborators/register-collaborator.service";

@Module({
    imports: [DatabaseModule],
    controllers: [
        CreateAccountController,
        AuthenticateController,
        RegisterCollaboratorController
    ],
    providers: [
        CreateAccountService,
        AuthenticateService,
        RegisterCollaboratorService
    ]
})
export class HttpModule{}