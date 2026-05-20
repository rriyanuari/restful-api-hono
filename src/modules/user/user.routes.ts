import { prisma } from "~/lib/database";
import { buildCrudRouter } from "~/core/crud/build-crud-router";
import { authAccessMiddleware } from "~/middleware/auth.middleware";
import { formatUser, hashUserPassword } from "./user.format";
import { createUserSchema, updateUserSchema } from "./user.validation";
import { permissionMap } from "~/core/rbac/permission-map";

const crud = buildCrudRouter({
  model: prisma.user,
  middlewares: [authAccessMiddleware],
  useUserScope: false,
  permissions: permissionMap.user,

  formatter: {
    single: formatUser,
    many: (users) => users.map(formatUser),
  },

  validation: {
    create: createUserSchema,
    update: updateUserSchema,
  },

  hooks: {
    beforeCreate: hashUserPassword,
    beforeUpdate: hashUserPassword,
  },
});

const userRoutes = crud.router;

export default userRoutes;
