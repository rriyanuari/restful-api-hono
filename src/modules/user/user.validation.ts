import { z } from "zod";

export const createUserSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.email().min(1).max(100),
  password: z.string().min(1).max(100),
});

export const updateUserSchema = createUserSchema.partial();
