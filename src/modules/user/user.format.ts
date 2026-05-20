import {
  Permission,
  Role,
  RolePermission,
  User,
  UserRole,
  UserToken,
} from "~/lib/generated/prisma/client";
import { hashPassword } from "~/utils/password";

export type UserWithOptionalInclude = {
  userTokens?: UserToken[];
  userRoles: ({
    role: {
      rolePermissions: ({
        permission: Permission;
      } & RolePermission)[];
    } & Permission;
  } & UserRole)[];
} & User;

export function formatUser(user: UserWithOptionalInclude) {
  return {
    uuid: user.uid,
    name: user.name,
    email: user.email,
    createdAt: user.created_at,
    updatedAt: user.updated_at,
    deletedAt: user.deleted_at,
    userTokens: user.userTokens?.map((token) => ({
      deviceType: token.device_type,
      tokenType: token.token_type,
      expiresAt: token.expires_at,
      createdAt: token.created_at,
      updatedAt: token.updated_at,
    })),
    userRoles: user?.userRoles?.map((userRole) => ({
      roleName: userRole?.role.name,
      permissions: userRole?.role.rolePermissions?.map(
        (rp) => rp.permission.name,
      ),
    })),
  };
}

export async function hashUserPassword(data: User) {
  if (!data.password) {
    return data;
  }

  return {
    ...data,
    password: await hashPassword(data.password),
  };
}
