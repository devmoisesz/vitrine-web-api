import { User } from "@prisma/client";

export class UsersPresenter {
    static toHTTP(user: User){
        return{
            name: user.name,
            email: user.email
        }
    }
}