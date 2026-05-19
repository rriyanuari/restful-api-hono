import { jwt } from "hono/jwt";
import type { JwtVariables } from "hono/jwt";

export type AuthVariables = JwtVariables;

export const authAccessMiddleware = jwt({
  secret: Bun.env.JWT_SECRET_ACCESS_KEY!,
  alg: "HS256",
});

export const authRefreshMiddleware = jwt({
  secret: Bun.env.JWT_SECRET_REFRESH_KEY!,
  alg: "HS256",
});