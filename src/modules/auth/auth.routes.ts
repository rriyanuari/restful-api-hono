import { Hono } from "hono"
import { login, refresh, register } from "./auth.controller"
import { authMiddleware } from "~/middleware/auth.midlleware"

const authRoutes = new Hono()

authRoutes.post('/register', register)
authRoutes.post('/login', login)
authRoutes.get('/refresh', authMiddleware, refresh)

export default authRoutes