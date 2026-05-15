import { z, ZodType } from "zod";

export class AuthValidation {
  static readonly REGISTER = z.object({
    name: z.string().min(1).max(100),
    email: z.email().min(1).max(100),
    password: z.string().min(1).max(100),
  });

  static readonly LOGIN = z.object({
    email: z.email().min(1).max(100),
    password: z.string().min(1).max(100),
    device: z.string().min(1).max(20),
  });
}
