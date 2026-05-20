import { prisma } from "~/lib/database";
import { buildCrudRouter } from "~/core/crud/build-crud-router";
import { authAccessMiddleware } from "~/middleware/auth.middleware";
import {
  createRoleSchema,
  updateRoleSchema,
} from "./role.validation";
import { permissionMap } from "~/core/rbac/permission-map";
import { formatRole } from "./role.format";

const crud = buildCrudRouter({
  model: prisma.role,
  middlewares: [authAccessMiddleware],
  useUserScope: false,
  // permissions: permissionMap.role,

  formatter: {
    single: formatRole,
    many: (roles) => roles.map(formatRole),
  },

  validation: {
    create: createRoleSchema,
    update: updateRoleSchema,
  },

  hooks: {},
});

const roleRoutes = crud.router;

export default roleRoutes;
