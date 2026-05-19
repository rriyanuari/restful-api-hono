import { User } from "~/lib/generated/prisma/client";
import { hashPassword } from "~/utils/password";

export function formatUser(user: User) {
  return {
    uuid: user.uid,
    name: user.name,
    email: user.email,
    createdAt: user.created_at,
    updatedAt: user.updated_at,
    deletedAt: user.deleted_at,
  };
}

export async function hashUserPassword(
  data: User,
) {
  if (!data.password) {
    return data
  }

  return {
    ...data,
    password: await hashPassword(data.password),
  }
}