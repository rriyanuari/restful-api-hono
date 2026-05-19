import { UserWithOptionalInclude } from "~/modules/user/user.format";

export function getUserPermissions(
  user: UserWithOptionalInclude,
): string[] {
  const permissions =
    user.userRoles?.flatMap(
      (userRole: any) =>
        userRole.role.rolePermissions.map(
          (rp: any) =>
            rp.permission.code,
        ),
    )

  return [...new Set(permissions)]
}