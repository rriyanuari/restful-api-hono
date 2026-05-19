import ms, { StringValue } from "ms";
import { sign, verify } from "hono/jwt";
import { User } from "~/lib/generated/prisma/browser";

function parseExpiration(value: StringValue): number {
  const parsed = ms(value);

  if (parsed === undefined) {
    throw new Error(`Invalid duration format: ${value}`);
  }

  return Math.floor(parsed / 1000);
}

export async function signToken(user: User, type: "access" | "refresh") {
const now = Math.floor(Date.now() / 1000);

  const accessTokenExpiresIn = parseExpiration(
    Bun.env.JWT_ACCESS_TOKEN_EXPIRES_IN as StringValue || "15m"
  );

  const refreshTokenExpiresIn = parseExpiration(
    Bun.env.JWT_REFRESH_TOKEN_EXPIRES_IN as StringValue || "1d"
  );

const exp =
  type === "access"
    ? now + accessTokenExpiresIn
    : now + refreshTokenExpiresIn;

  const payload = {
    sub: user.uid,
    exp,
  };
  const secretAccess = Bun.env.JWT_SECRET_ACCESS_KEY!;
  const secretRefresh = Bun.env.JWT_SECRET_REFRESH_KEY!;

  const secret = type === "access" ? secretAccess : secretRefresh;

  const token = await sign(payload, secret, 'HS256');

  return {token, exp};
}

export  async function verifyToken(token: string) {
  const isValid = await verify(token, Bun.env.JWT_SECRET_KEY!, 'HS256');
  return isValid;
}