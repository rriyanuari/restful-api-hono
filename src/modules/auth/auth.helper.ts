import { prisma } from "~/lib/database";
import { User } from "~/lib/generated/prisma/client";
import { signToken } from "~/utils/token";
import { formatUser } from "../user/user.format";

export async function generateAuthHelper(user: User, device: string) {
  const accessToken = await signToken(user, "access");
  const refreshToken = await signToken(user, "refresh");

  await prisma.userToken.upsert({
    where: {
      userId_device_type_key: {
        userId: user.id,
        device_type: device,
      },
    },

    update: {
      value: refreshToken.token,
      token_type: "refresh",
      expires_at: new Date(refreshToken.exp * 1000),
    },

    create: {
      userId: user.id,
      device_type: device,
      token_type: "refresh",
      value: refreshToken.token,
      expires_at: new Date(refreshToken.exp * 1000),
    },
  });

  return {
    user: formatUser(user),
    access_token: accessToken.token,
    refresh_token: refreshToken.token,
  };
}