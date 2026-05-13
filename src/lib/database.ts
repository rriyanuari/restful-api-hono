import "dotenv/config";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "./generated/prisma/client";
import { logger } from "./logging";

const adapter = new PrismaMariaDb({
  host: Bun.env.DATABASE_HOST,
  user: Bun.env.DATABASE_USER,
  password: Bun.env.DATABASE_PASSWORD,
  database: Bun.env.DATABASE_NAME,
  connectionLimit: 5,
});

export const prisma = new PrismaClient({
  adapter
});
