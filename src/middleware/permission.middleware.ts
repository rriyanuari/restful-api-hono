import { createMiddleware } from "hono/factory";
import { throwForbidden } from "~/core/errors/auth-error";
import { resolveAuthUser } from "~/utils/resolveAuthUser";

import { getUserPermissions } from "~/utils/getUserPermissions";

export function permissionMiddleware(permission: string) {
  return createMiddleware(async (c, next) => {
    const authUser = await resolveAuthUser(c);

    const permissions = getUserPermissions(authUser);
    const hasPermission = permissions.includes(permission);

    if (!hasPermission) {
      throwForbidden();
    }

    await next();
  });
}
