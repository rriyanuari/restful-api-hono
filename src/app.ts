import { Hono } from 'hono'
import { errorHandler, notFound } from './middleware/error.middleware'
import { loggerMiddleware } from './middleware/logger.middlewares'

import apiRoutes from './routes'
import { getRouterName, showRoutes } from 'hono/dev'

const app = new Hono()

// Logger middleware using Winston logger
app.use(loggerMiddleware)

app.route('/', apiRoutes)

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

// Error Handler (improved to use err)
app.onError(errorHandler)

// Not Found Handler (standardized response)
app.notFound(notFound)

export default app
