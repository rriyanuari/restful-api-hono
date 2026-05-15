import type { Context, ErrorHandler, NotFoundHandler } from 'hono'
import { HTTPException } from 'hono/http-exception'
import type { StatusCode } from 'hono/utils/http-status'
import { ZodError } from 'zod'
import { logger } from '~/lib/logger'
import { getClientIp } from '~/utils/getIp'

const isProduction = process.env.NODE_ENV === 'production'

type ErrorWithStatus = Error & { status?: number }
type RequestLogLevel = 'warn' | 'error'
type RequestErrorKind =
  | 'http_exception'
  | 'validation_error'
  | 'internal_error'
  | 'not_found'

const getRequestLogMeta = (c: Context) => ({
  method: c.req.method,
  path: c.req.path,
  url: c.req.url,
  userAgent: c.req.header('user-agent'),
  ip: getClientIp(c),
})

const getStatusCode = (err: ErrorWithStatus, c: Context): StatusCode => {
  const currentStatus = err.status ?? c.newResponse(null).status
  return (currentStatus !== 200 ? currentStatus : 500) as StatusCode
}

const logRequestIssue = (
  c: Context,
  {
    event,
    level,
    status,
    message,
    errorKind,
    stack,
  }: {
    event: string
    level: RequestLogLevel
    status: number
    message: string
    errorKind: RequestErrorKind
    stack?: string
  },
) => {
  const meta = {
    logGroup: 'error',
    errorKind,
    status,
    message,
    ...getRequestLogMeta(c),
    ...(stack ? { stack } : {}),
  }

  if (level === 'warn') {
    logger.warn(event, meta)
    return
  }

  logger.error(event, meta)
}

const toErrorResponse = (message: string, stack?: string) => ({
  errors: message,
  ...(isProduction || !stack ? {} : { stack }),
})

// Request-scoped failures belong to the "error" group.
// Uncaught exceptions and unhandled rejections are routed by Winston in logger.ts.
export const errorHandler: ErrorHandler = (err, c) => {
  if (err instanceof HTTPException) {
    const level: RequestLogLevel = err.status >= 500 ? 'error' : 'warn'

    logRequestIssue(c, {
      event: 'HTTP exception',
      level,
      status: err.status,
      message: err.message,
      errorKind: 'http_exception',
      ...(level === 'error' ? { stack: err.stack } : {}),
    })

    c.status(err.status)

    return c.json(toErrorResponse(err.message, err.stack))
  }

  if (err instanceof ZodError) {
    logRequestIssue(c, {
      event: 'Validation error',
      level: 'warn',
      status: 400,
      message: 'Request validation failed',
      errorKind: 'validation_error',
    })

    c.status(400)

    return c.json({
      errors: err.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      })),
    })
  }

  const statusCode = getStatusCode(err as ErrorWithStatus, c)

  logRequestIssue(c, {
    event: 'Unhandled request error',
    level: 'error',
    status: statusCode,
    message: err.message,
    errorKind: 'internal_error',
    stack: err.stack,
  })

  c.status(statusCode)

  return c.json(toErrorResponse(err.message, err.stack))
}

export const notFound: NotFoundHandler = (c) => {
  logRequestIssue(c, {
    event: 'Route not found',
    level: 'warn',
    status: 404,
    message: 'Not Found - No matching route',
    errorKind: 'not_found',
  })

  return c.json(
    {
      message: `Not Found - [${c.req.method}]:[${c.req.path}]`,
    },
    404,
  )
}
