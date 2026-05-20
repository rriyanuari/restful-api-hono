import { prisma } from "~/lib/database";
import { seedRoles } from "./seeder/role.seeder";
import { seedPermissions } from "./seeder/permission.seeder";

async function main() {
  console.log("======= Permissions synced Starting =======");
  await seedPermissions();
  console.log("======= Permissions synced Completed =======");

  console.log("======= Roles seeded Starting =======");
  await seedRoles();
  console.log("======= Roles seeded Completed =======");

}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
