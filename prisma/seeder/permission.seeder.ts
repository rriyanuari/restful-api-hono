import { getAllPermissions } from "~/core/rbac/get-all-permissions";
import { humanizePermission } from "~/core/rbac/humanize-permission";
import { prisma } from "~/lib/database";

export async function seedPermissions() {
  const existingPermissions = await prisma.permission.findMany();
  const existingCodes = existingPermissions.map((p) => p.code);

  const registryPermissions = getAllPermissions();
  const unusedPermissions = existingCodes.filter(
    (code) => !registryPermissions.includes(code),
  );

  if (unusedPermissions.length) {
    await prisma.permission.deleteMany({
      where: {
        code: {
          in: unusedPermissions,
        },
      },
    });
  }

  for (const code of registryPermissions) {
    await prisma.permission.upsert({
      where: {
        code,
      },

      update: {},

      create: {
        uid: crypto.randomUUID(),
        code,
        name: humanizePermission(code),
      },
    });
  }
}
