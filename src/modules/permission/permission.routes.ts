import { prisma } from "~/lib/database";
import { buildCrudRouter } from "~/core/crud/build-crud-router";
import { authAccessMiddleware } from "~/middleware/auth.middleware.ts";
import { formatPermission } from "./permission.format";
import {
  createPermissionSchema,
  updatePermissionSchema,
} from "./permission.validation";

const crud = buildCrudRouter({
  model: prisma.permission,
  middlewares: [authAccessMiddleware],
  useUserScope: false,

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
