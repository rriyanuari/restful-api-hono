import { Permission, Role, RolePermission } from "~/lib/generated/prisma/client";

export type RoleWithPermissions = {
  rolePermissions?: (RolePermission & {
    permission: Permission;
  })[];
} & Role;

export function formatRole(role: RoleWithPermissions) {
  return {
    uid: role.uid,
    name: role.name,
    code: role.code,
    // createdAt: role.created_at,
    // updatedAt: role.updated_at,
    permissions: role?.rolePermissions?.map((perm) => ({
        uid: perm.permission.uid,
        name: perm.permission.name,
        code: perm.permission.code,
        // createdAt: perm.permission.created_at,
        // updatedAt: perm.permission.updated_at,
    })),
  };
}