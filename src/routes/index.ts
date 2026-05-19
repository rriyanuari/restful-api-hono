import { Hono } from "hono";
import authRoutes from "~/modules/auth/auth.routes";
import permissionRoutes from "~/modules/permission/permission.routes";
import userRoutes from "~/modules/user/user.routes";

const apiRoutes = new Hono().basePath('/api/v1')

apiRoutes.route('/auth', authRoutes)
apiRoutes.route('/users', userRoutes)
apiRoutes.route('/permissions', permissionRoutes)

export default apiRoutes