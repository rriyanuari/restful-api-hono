import z from "zod";

export const createRoleSchema = z.object({
  name: z.string().min(1),
  code: z
    .string()
    .min(1),
  permissions: z.array(z.string())
});

export const updateRoleSchema = createRoleSchema.partial();
