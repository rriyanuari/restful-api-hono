import type { Context } from "hono";

import { loginService, refreshService, registerService } from "./auth.service";
import { loginSchema, refreshSchema, registerSchema } from "./auth.validation";
import { validateBody } from "~/utils/validator";
import { throwUnauthorized } from "~/core/errors/auth-error";

export const registerHandler = async (c: Context) => {
  const payload = await validateBody(c, registerSchema);

  const result = await registerService(payload);

  return c.json(
    {
      success: true,
      message: "User successfully registered",
      data: result,
    },
    201,
  );
};

export const loginHandler = async (c: Context) => {
  const payload = await validateBody(c, loginSchema);

  const result = await loginService(payload);

  return c.json({
    success: true,
    message: "User successfully logged in",
    data: result,
  });
};

export const refreshHandler = async (c: Context) => {
  const authHeader = c.req.header("Authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    throwUnauthorized();
  }

  const jwtPayload = c.get("jwtPayload");
  const payload = await validateBody(c, refreshSchema);

  const result = await refreshService(payload, jwtPayload, token);

  return c.json({
    success: true,
    message: "User successfully refreshed",
    data: result,
  });
};
