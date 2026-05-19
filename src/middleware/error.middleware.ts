import type { Context, ErrorHandler, NotFoundHandler } from "hono";
import { HTTPException } from "hono/http-exception";
import type { ContentfulStatusCode, StatusCode } from "hono/utils/http-status";
import { ZodError } from "zod";

import { logger } from "~/lib/logger";
import { getClientIp } from "~/utils/getIp";
import { AppError } from "~/core/errors/app-error";
import { Prisma } from "~/lib/generated/prisma/client";
import { isProduction } from "~/utils/environment";

type ErrorWithStatus = Error & { status?: number };

const getRequestLogMeta = (c: Context) => ({
  method: c.req.method,
  path: c.req.path,
  url: c.req.url,
  userAgent: c.req.header("user-agent"),
  ip: getClientIp(c),
});

const logError = (c: Context, err: Error, status: number, type: string) => {
  logger.error(type, {
    logGroup: "error",
    status,
    message: err.message,
    stack: err.stack,
    ...getRequestLogMeta(c),
  });
};

const errorResponse = ({
  message,
  errors,
  stack,
}: {
  message: string;
  errors?: unknown;
  stack?: string;
}) => ({
  success: false,
  message,
  // only show errors in development or explicitly exposed
  ...(!isProduction && errors ? { errors } : {}),

  // only show stack in development
  ...(!isProduction && stack ? { stack } : {}),
});

export const errorHandler: ErrorHandler = (err, c) => {
  /**
   * APP ERROR
   */
  if (err instanceof AppError) {
    logError(c, err, err.status, "app_error");

    return c.json(
      errorResponse({
        message: err.message,
        errors: err.errors,
      }),
      err.status as ContentfulStatusCode,
    );
  }

  /**
   * HTTP EXCEPTION
   */
  if (err instanceof HTTPException) {
    let message = err.message;

    if (err.status === 401) {
      message = "Authentication required";
    }

    if (err.status === 403) {
      message = "Access forbidden";
    }

    return c.json(
      errorResponse({
        message: message,
        stack: err.stack,
      }),
      err.status,
    );
  }

  /**
   * ZOD ERROR
   */
  if (err instanceof ZodError) {
    return c.json(
      errorResponse({
        message: "Validation Error",
        errors: err.flatten(),
      }),
      422,
    );
  }

  /**
   * PRISMA ERROR
   */
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    // Unique constraint
    if (err.code === "P2002") {
      return c.json(
        errorResponse({
          message: "Duplicate data",
          errors: isProduction ? undefined : err.meta,
        }),
        409,
      );
    }

    // Record not found
    if (err.code === "P2025") {
      return c.json(
        errorResponse({
          message: "Data not found",
        }),
        404,
      );
    }

    // Foreign key constraint
    if (err.code === "P2003") {
      return c.json(
        errorResponse({
          message: "Invalid relation reference",
        }),
        400,
      );
    }
  }

  /**
   * UNKNOWN ERROR
   */
  const statusCode = ((err as ErrorWithStatus).status || 500) as StatusCode;

  logError(c, err, statusCode, "internal_error");

  return c.json(
    errorResponse({
      message: err.message || "Internal Server Error",
      stack: err.stack,
    }),
    statusCode as ContentfulStatusCode,
  );
};

export const notFound: NotFoundHandler = (c) => {
  return c.json(
    {
      success: false,
      message: `Not Found - [${c.req.method}] ${c.req.path}`,
    },
    404,
  );
};
