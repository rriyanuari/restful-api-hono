import { permissionMap } from "./permission-map";

export function getAllPermissions(): string[] {
  return Object.values(permissionMap).flatMap((group) => Object.values(group));
}
