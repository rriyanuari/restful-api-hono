import z from "zod";
import { User } from "../../lib/generated/prisma/client";
import { BaseResponse, toBaseResponse } from "../base/base.model";
import { UserValidation } from "./user.validation";

export type CreateUserRequest = z.infer<typeof UserValidation.CREATE>;

export type UpdateUserRequest = z.infer<typeof UserValidation.UPDATE>

export interface UserResponse extends BaseResponse {
  name: string;
  email: string;
};

export function toUserResponse(user: User): UserResponse {
  return {
    ...toBaseResponse(user),

    name: user.name,
    email: user.email,
  };
}


