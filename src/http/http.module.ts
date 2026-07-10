import { DatabaseModule } from "@/database/database.module";
import { Module } from "@nestjs/common";
import { CreateAccountService } from "@/use-cases/services/users/create-account.service";
import { CreateAccountController } from "./controllers/users/create-account.controller";

@Module({
    imports: [DatabaseModule],
    controllers: [
        CreateAccountController
    ],
    providers: [
        CreateAccountService
    ]
})
export class HttpModule{}