import { Hono } from "hono";
import authRoutes from "~/modules/auth/auth.routes";
import userRoutes from "~/modules/user/user.routes";

const apiRoutes = new Hono().basePath('/api/v1')

apiRoutes.route('/auth', authRoutes)
apiRoutes.route('/users', userRoutes)

export default apiRoutes