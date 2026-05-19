import { Permission } from "~/lib/generated/prisma/client";

export function formatPermission(permission: Permission) {
  return {
    uid: permission.uid,
    name: permission.name,
    code: permission.code,
    createdAt: permission.created_at,
    updatedAt: permission.updated_at,
  }
}