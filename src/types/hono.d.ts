import { User } from "~/lib/generated/prisma/client";
import { JwtPayload } from "~/types/auth";

declare module 'hono' {
  interface ContextVariableMap {
    jwtPayload: JwtPayload,
    authUser: User
  }
}