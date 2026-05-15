import { Context } from "hono";

// Extract client IP (consistent with rate limiter logic)
// x-forwarded-for can contain multiple IPs (comma-separated), extract the first one

export const getClientIp = (c: Context): string => {
  const cfIp = c.req.header("cf-connecting-ip");
  if (cfIp) return cfIp;

  const forwardedFor = c.req.header("x-forwarded-for");
  if (forwardedFor) {
    // Extract first IP from comma-separated list and trim whitespace
    return forwardedFor.split(",")[0]?.trim() || "unknown";
  }

  const realIp = c.req.header("x-real-ip");
  if (realIp) return realIp;

  return "unknown";
};
