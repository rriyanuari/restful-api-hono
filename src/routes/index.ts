import { Hono } from "hono";
import { showRoutes } from "hono/dev";
import authRoutes from "~/modules/auth/auth.routes";
import permissionRoutes from "~/modules/permission/permission.routes";
import roleRoutes from "~/modules/role/role.routes";
import userRoutes from "~/modules/user/user.routes";

const apiRoutes = new Hono().basePath('/api/v1')

apiRoutes.route('/auth', authRoutes)
apiRoutes.route('/users', userRoutes)
apiRoutes.route('/permissions', permissionRoutes)
apiRoutes.route('/roles', roleRoutes)

showRoutes(apiRoutes, {
  verbose: true,
})


export default apiRoutes