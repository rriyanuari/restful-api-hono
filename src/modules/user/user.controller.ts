import { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import { toUserResponse } from "./user.model";
import { UserValidation } from "./user.validation";

import { prisma } from "~/lib/database";
import { hashPassword } from "~/utils/password";

export const getUsers = async (c: Context) => {
  const users = await prisma.user.findMany({
    select: {
      uid: true,
      name: true,
      email: true,
      created_at: true,
      updated_at: true,
      deleted_at: true,
    },
    where: {
      deleted_at: null,
    },
  });

  return c.json({
    data: users,
  });
};

export const getUserById = async (c: Context) => {
  const id = c.req.param("id");
  const user = await prisma.user.findUnique({
    where: {
      uid: id,
    },
  });

  if (!user) {
    throw new HTTPException(404, { message: "User not found" });
  }

  return c.json({ message: "Data found", data: toUserResponse(user) });
};

export const createUsers = async (c: Context) => {
  const body = await c.req.json();
  const { email, name, password } = UserValidation.CREATE.parse(body);

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
      message: "User successfully created",
      data: toUserResponse(user),
    },
    201,
  );
};

export const updateUsers = async (c: Context) => {
  const id = c.req.param("id");

  const existingUser = await prisma.user.findUnique({
    where: {
      uid: id,
    },
  });

  if (!existingUser) {
    throw new HTTPException(404, {
      message: "User not found",
    });
  }

  const body = await c.req.json();
  const { email, name, password } = UserValidation.UPDATE.parse(body);

  // cek email duplicate selain user saat ini
  if (email) {
    const isExist = await prisma.user.findUnique({
      where: {
        email,
        NOT: {
          uid: id,
        },
      },
    });

    if (isExist) {
      throw new HTTPException(400, {
        message: "Email already exists",
      });
    }
  }

  const data = {
    ...(email && { email }),
    ...(name && { name }),
    ...(password && {
      password: await Bun.password.hash(password, {
        algorithm: "bcrypt",
        cost: 10,
      }),
    }),
  };

  const user = await prisma.user.update({
    where: {
      uid: id,
    },
    data,
  });

  return c.json(
    {
      message: "User successfully updated",
      data: toUserResponse(user),
    },
    200,
  );
};

export const softDeleteUsers = async (c: Context) => {
  const id = c.req.param("id");

  const existingUser = await prisma.user.findUnique({
    where: {
      uid: id,
    },
  });

  if (!existingUser) {
    throw new HTTPException(404, {
      message: "User not found",
    });
  }

  const deletedEmail = `${existingUser.email}#deleted#${Date.now()}`;

  await prisma.user.update({
    where: {
      uid: id,
    },
    data: {
      email: deletedEmail,
      deleted_at: new Date(),
    },
  });

  return c.json(
    {
      message: "User successfully deleted",
    },
    200,
  );
};
