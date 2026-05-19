import { HTTPException } from "hono/http-exception";
import z from "zod";

import { prisma } from "~/lib/database";
import { JwtPayload } from "~/types/auth";
import { formatUser } from "~/modules/user/user.format";
import { hashPassword, verifyPassword } from "~/utils/password";
import {
  throwInvalidCredential,
  throwUnauthorized,
} from "~/core/errors/auth-error";

import { loginSchema, refreshSchema, registerSchema } from "./auth.validation";
import { generateAuthHelper } from "./auth.helper";

export async function registerService(payload: z.infer<typeof registerSchema>) {
  const { email, name, password } = payload;

  const isExist = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (isExist) {
    throw new HTTPException(400, {
      message: "Email already exists",
    });
  }

  const passwordHash = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      uid: crypto.randomUUID(),
      email,
      name,
      password: passwordHash,
    },
  });

  return formatUser(user);
}

export async function loginService(payload: z.infer<typeof loginSchema>) {
  const { email, password, device } = payload;

  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!user) {
    throwInvalidCredential();
  }

  const isPasswordValid = await verifyPassword(password, user.password);

  if (!isPasswordValid) {
    throwInvalidCredential();
  }

  return generateAuthHelper(user, device);
}

export async function refreshService(
  payload: z.infer<typeof refreshSchema>,
  jwtPayload: JwtPayload,
  rawToken: string,
) {
  const userId = jwtPayload?.sub;

  if (!userId) {
    throwUnauthorized();
  }

  // Check user valid or not expired
  const user = await prisma.user.findUnique({
    where: {
      uid: userId,
    },
  });

  if (!user) {
    throwUnauthorized();
  }

  // Check token valid or not expired
  const isValidToken = await prisma.userToken.findFirst({
    where: {
      userId: user.id,
      device_type: payload.device,
      value: rawToken,
      expires_at: {
        gt: new Date(),
      },
    },
  });

  if (!isValidToken) {
    throwUnauthorized();
  }

  return generateAuthHelper(user, payload.device);
}
