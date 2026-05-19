import type { Context } from "hono";

import { prisma } from "~/lib/database";
import { JwtPayload } from "~/types/auth";
import { throwUnauthorized } from "~/core/errors/auth-error";

export async function resolveAuthUser(c: Context) {
  // cached
  const cached = c.get("authUser");

  if (cached) {
    return cached;
  }

  const payload = c.get("jwtPayload") as JwtPayload;

  if (!payload?.sub) {
    throwUnauthorized();
  }

  const user = await prisma.user.findUnique({
    where: {
      uid: payload.sub,
    },

    include: {
      userRoles: {
        include: {
          role: {
            include: {
              rolePermissions: {
                include: {
                  permission: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!user) {
    throwUnauthorized();
  }

  c.set("authUser", user);
  return user;
}
