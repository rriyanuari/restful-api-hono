import { CrudPermissions } from "~/types/auth";

interface PermissionMap {
  user: CrudPermissions;
  role: CrudPermissions;
  permission: CrudPermissions;
}

export const permissionMap: PermissionMap = {
  user: {
    view: "user.view",
    create: "user.create",
    update: "user.update",
    delete: "user.delete",
  },

  role: {
    view: "role.view",
    create: "role.create",
    update: "role.update",
    delete: "role.delete",
  },

  permission: {
    view: "permission.view",
    create: "permission.create",
    update: "permission.update",
    delete: "permission.delete",
  },
} as const;
