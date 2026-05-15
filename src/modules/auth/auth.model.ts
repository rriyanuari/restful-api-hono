import z from "zod";
import { AuthValidation } from "./auth.validation";

export type RegisterRequest = z.infer<typeof AuthValidation.REGISTER>;

export type LoginRequest = z.infer<typeof AuthValidation.LOGIN>;


