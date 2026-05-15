import { jwt } from "hono/jwt";
import type { JwtVariables } from "hono/jwt";

export type AuthVariables = JwtVariables;

export const authMiddleware = jwt({
  secret: Bun.env.JWT_SECRET_KEY!,
  alg: "HS256",
});