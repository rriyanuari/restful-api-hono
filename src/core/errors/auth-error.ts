import { HTTPException } from 'hono/http-exception'

export function throwUnauthorized(): never {
  throw new HTTPException(401, {
    message: 'Unauthorized',
  })
}

export function throwInvalidCredential(): never {
  throw new HTTPException(400, {
    message:
      'Username or password is not valid',
  })
}