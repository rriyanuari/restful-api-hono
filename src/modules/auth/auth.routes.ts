import { Hono } from "hono"
import { authRefreshMiddleware } from "~/middleware/auth.midlleware"
import { loginHandler, refreshHandler, registerHandler } from "./auth.handler"

const authRoutes = new Hono()

authRoutes.post('/register', registerHandler)
authRoutes.post('/login', loginHandler)
authRoutes.post('/refresh', authRefreshMiddleware, refreshHandler)

export default authRoutes