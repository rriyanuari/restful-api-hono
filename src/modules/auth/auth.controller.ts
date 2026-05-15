import { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import { AuthValidation } from "./auth.validation";

import { prisma } from "~/lib/database";
import { hashPassword, verifyPassword } from "~/utils/password";
import { signToken } from "~/utils/token";
import { toUserResponse } from "../user/user.model";
import { bearerAuth } from "hono/bearer-auth";

export const register = async (c: Context) => {
  const body = await c.req.json();
  const { email, name, password } = AuthValidation.REGISTER.parse(body);

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

  return c.json(
    {
      message: "User successfully registered",
      data: toUserResponse(user),
    },
    201,
  );
};

export const login = async (c: Context) => {
  const body = await c.req.json();
  const { email, password, device } = AuthValidation.LOGIN.parse(body);

  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!user) {
    throw new HTTPException(404, {
      message: "Username or password is not valid",
    });
  }

  const isPasswordValid = await verifyPassword(password, user.password);

  if (!isPasswordValid) {
    throw new HTTPException(400, {
      message: "Username or password is not valid",
    });
  }

  const accessToken = await signToken(user, "access");
  const refreshToken = await signToken(user, "refresh");

  await prisma.userToken.upsert({
    where: {
      userId_device_type_key: {
        userId: user.id,
        device_type: device,
      },
    },
    update: {
      value: refreshToken.token,
      token_type: "refresh",
      expires_at: new Date(refreshToken.exp * 1000),
    },
    create: {
      userId: user.id,
      device_type: device,
      token_type: "refresh",
      value: refreshToken.token,
      expires_at: new Date(refreshToken.exp * 1000),
    },
  });

  return c.json(
    {
      message: "User successfully logged in",
      data: {
        user: toUserResponse(user),
        access_token: accessToken.token,
        refresh_token: refreshToken.token,
      },
    },
    201,
  );
};

export const refresh = async (c: Context) => {
  const payload = c.get('jwtPayload')

  return c.json(payload)
}