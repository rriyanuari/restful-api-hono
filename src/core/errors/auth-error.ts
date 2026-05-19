import { HTTPException } from 'hono/http-exception'

export function throwForbidden(): never {
  throw new HTTPException(403, {
    message: 'Forbidden',
  })
}

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