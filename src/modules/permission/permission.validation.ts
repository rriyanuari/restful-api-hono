import z from "zod";

export const createPermissionSchema = z.object({
  name: z.string().min(1),

  code: z
    .string()
    .min(1)
    .regex(/^[a-z0-9_]+$/),
});

export const updatePermissionSchema = createPermissionSchema.partial();
