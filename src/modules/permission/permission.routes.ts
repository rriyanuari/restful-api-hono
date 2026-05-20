import { prisma } from "~/lib/database";
import { buildCrudRouter } from "~/core/crud/build-crud-router";
import { authAccessMiddleware } from "~/middleware/auth.middleware";
import { formatPermission } from "./permission.format";
import {
  createPermissionSchema,
  updatePermissionSchema,
} from "./permission.validation";
import { permissionMap } from "~/core/rbac/permission-map";

const crud = buildCrudRouter({
  model: prisma.permission,
  middlewares: [authAccessMiddleware],
  useUserScope: false,
  // permissions: permissionMap.permission,

  formatter: {
    single: formatPermission,
    many: (permissions) => permissions.map(formatPermission),
  },

  validation: {
    create: createPermissionSchema,
    update: updatePermissionSchema,
  },

  hooks: {},
});

const permissionRoutes = crud.router;

export default permissionRoutes;
