import { User } from "~/lib/generated/prisma/client";
import { UserWithOptionalInclude } from "~/modules/user/user.format";
import { JwtPayload } from "~/types/auth";

declare module 'hono' {
  interface ContextVariableMap {
    jwtPayload: JwtPayload,
    authUser: UserWithOptionalInclude
  }
}