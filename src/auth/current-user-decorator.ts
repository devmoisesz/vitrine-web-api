import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { UserPayload } from "./jwt-payload";

export const CurrentUser = createParamDecorator(
    (_: unknown, context: ExecutionContext) => {
        const req = context.switchToHttp().getRequest()

        return req.user as UserPayload
    }
)