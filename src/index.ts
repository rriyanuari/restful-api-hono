import { Hono } from 'hono'
import userRoutes from './modules/user/user.routes'
import { errorHandler, notFound } from './middleware/error.middleware'
import { loggerMiddleware } from './middleware/logger.middlewares'

const app = new Hono().basePath('/api/v1')

// Logger middleware using Winston logger
app.use(loggerMiddleware)

app.route('/users', userRoutes)

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

// Error Handler (improved to use err)
app.onError(errorHandler)

// Not Found Handler (standardized response)
app.notFound(notFound)

export default app
