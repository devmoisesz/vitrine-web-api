import { DatabaseModule } from "@/database/database.module";
import { Module } from "@nestjs/common";
import { CreateAccountController } from "./controllers/create-account.controller";
import { CreateAccountService } from "@/use-cases/services/users/create-account.service";

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