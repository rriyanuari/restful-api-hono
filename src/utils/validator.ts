import type { Context } from 'hono'

import type { ZodType } from 'zod'

export async function validateBody<T>(
  c: Context,
  schema: ZodType<T>,
) {
  const body = await c.req.json()

  return schema.parse(body)
}