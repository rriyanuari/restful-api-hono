import { ErrorHandler, NotFoundHandler } from "hono";
import { HTTPException } from "hono/http-exception";
import { StatusCode } from "hono/utils/http-status";
import { ZodError } from "zod";

const isProduction = process.env.NODE_ENV === "production";

// Error Handler
export const errorHandler: ErrorHandler = (err, c) => {
  const currentStatus =
    "status" in err ? err.status : c.newResponse(null).status;

  const statusCode =
    currentStatus !== 200 ? (currentStatus as StatusCode) : 500;

  // Log error in development
  if (!isProduction) {
    console.error("Error:", err);
  }

  if (err instanceof HTTPException) {
    c.status(err.status);
    return c.json({
      errors: err.message,
      // Only show stack trace in development
      ...(isProduction ? {} : { stack: err?.stack }),
    });
  } else if (err instanceof ZodError) {
    c.status(400);
    return c.json({
      errors: err.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    });
  } else {
    c.status(500);
    return c.json({
      errors: err.message,
      // Only show stack trace in development
      ...(isProduction ? {} : { stack: err?.stack }),
    });
  }
};

// Not Found Handler
export const notFound: NotFoundHandler = (c) => {
  return c.json(
    {
      message: `Not Found - [${c.req.method}]:[${c.req.path}]`,
    },
    404,
  );
};
