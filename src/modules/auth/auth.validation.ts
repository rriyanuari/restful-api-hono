import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.email().min(1).max(100),
  password: z.string().min(1).max(100),
});

export const loginSchema = z.object({
  email: z.email().min(1).max(100),
  password: z.string().min(1).max(100),
  device: z.string().min(1).max(20),
});

export const refreshSchema = z.object({
  device: z.string().min(1).max(20),
});