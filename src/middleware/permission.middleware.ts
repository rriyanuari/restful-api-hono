import { createMiddleware } from "hono/factory";
import { throwForbidden } from "~/core/errors/auth-error";
import { resolveAuthUser } from "~/utils/resolveAuthUser";

import { getUserPermissions } from "~/utils/getUserPermissions";
import { logger } from "~/lib/logger";

export function permissionMiddleware(permission: string) {
  return createMiddleware(async (c, next) => {
    const authUser = await resolveAuthUser(c);

    logger.error("permission_check", {
      logGroup: "permission",
      permission,
      userId: authUser?.id,
    });

    const permissions = getUserPermissions(authUser);
    const hasPermission = permissions.includes(permission);

    if (!hasPermission) {
      throwForbidden();
    }

    await next();
  });
}
