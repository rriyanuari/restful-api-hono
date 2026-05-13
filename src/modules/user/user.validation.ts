import { z, ZodType } from "zod";

export class UserValidation {
  static readonly CREATE = z.object({
    name: z.string().min(1).max(100),
    email: z.email().min(1).max(100),
    password: z.string().min(1).max(100),
  });

  static readonly UPDATE = z.object({
    name: z.string().min(1).max(100).optional(),
    email: z.email().min(1).max(100).optional(),
    password: z.string().min(1).max(100).optional(),
  });

  static readonly LOGIN: ZodType = z.object({
    username: z.string().min(1).max(100),
    password: z.string().min(1).max(100),
  });

  static readonly TOKEN: ZodType = z.string().min(1);
}
