import { prisma } from "~/lib/database";
import { roleMap } from "~/core/rbac/role-map";

export async function seedRoles() {
  const allPermissions = await prisma.permission.findMany();

  for (const [code, roleData] of Object.entries(roleMap)) {
    const role = await prisma.role.upsert({
      where: {
        code,
      },
      update: {
        name: roleData.name,
      },
      create: {
        uid: crypto.randomUUID(),
        code,
        name: roleData.name,
      },
    });

    const permissions = roleData.permissions.includes('*')
      ? allPermissions
      : allPermissions.filter((p) =>
          roleData.permissions.includes(p.code as string),
        );

    await prisma.rolePermission.deleteMany({
      where: {
        roleId: role.id,
      },
    });

    if (permissions.length) {
      await prisma.rolePermission.createMany({
        data: permissions.map((permission) => ({
          roleId: role.id,
          permissionId: permission.id,
        })),
      });
    }

    console.log(`Seeded role: ${role.name}`);
  }
}
