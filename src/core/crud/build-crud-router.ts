import { Context, Hono, MiddlewareHandler } from "hono";
import type { ZodType } from "zod";

import { buildPagination } from "~/core/query/build-pagination";
import { buildOrderBy } from "~/core/query/build-order-by";
import { buildWhere } from "~/core/query/build-where";
import { buildInclude } from "~/core/query/build-include";
import { resolveAuthUser } from "~/utils/resolveAuthUser";
import { formatMany, formatSingle } from "~/utils/formatResponse";
import { permissionMiddleware } from "~/middleware/permission.middleware";
import { CrudPermissions } from "~/types/auth";

type Formatter<T = any> = (data: T) => any;

type CrudHook = (data: any, c: Context) => Promise<any> | any;

type CrudAfterHook = (data: any, c: Context) => Promise<void> | void;

type CrudOptions = {
  model: any;
  middlewares?: MiddlewareHandler[];
  permissions?: CrudPermissions;
  useUserScope?: boolean;

  formatter?: {
    single?: Formatter;
    many?: Formatter;
  };

  validation?: {
    create?: ZodType;
    update?: ZodType;
  };

  disableRoutes?: {
    index?: boolean;
    store?: boolean;
    update?: boolean;
    show?: boolean;
    destroy?: boolean;
  };

  hooks?: {
    beforeCreate?: CrudHook;
    afterCreate?: CrudAfterHook;

    beforeUpdate?: CrudHook;
    afterUpdate?: CrudAfterHook;
  };
};

export function buildCrudRouter(options: CrudOptions) {
  const router = new Hono();

  // // Apply middlewares
  if (options.middlewares?.length) {
    router.use("*", ...options.middlewares);
  }

  const index = async (c: Context) => {
    const query = c.req.query();

    const pagination = buildPagination(query);
    const where = buildWhere(query);
    const include = buildInclude(query.include);
    const orderBy = buildOrderBy(query);

    // user scope
    if (options.useUserScope) {
      const user = await resolveAuthUser(c);

      where.userId = user.id;
    }

    const [data, total] = await Promise.all([
      options.model.findMany({
        where,
        include,
        orderBy,
        skip: pagination.skip,
        take: pagination.take,
      }),

      options.model.count({
        where,
      }),
    ]);

    return c.json({
      success: true,
      data: formatMany(data, options.formatter?.many),
      meta: {
        total,
        page: pagination.page,
        limit: pagination.limit,
      },
    });
  };

  const show = async (c: Context) => {
    const include = buildInclude(c.req.query("include"));

    const data = await options.model.findUnique({
      where: {
        uid: c.req.param("id"),
      },
      include,
    });

    return c.json({
      success: true,
      data: formatSingle(data, options.formatter?.single),
    });
  };

  const store = async (c: Context) => {
    let body = await c.req.json();

    if (options.validation?.create) {
      body = options.validation.create.parse(body);
    }

    if (options.useUserScope) {
      const user = await resolveAuthUser(c);

      body.userId = user.id;
    }

    if (options.hooks?.beforeCreate) {
      body = await options.hooks.beforeCreate(body, c);
    }

    const created = await options.model.create({
      data: body,
    });

    if (options.hooks?.afterCreate) {
      await options.hooks.afterCreate(created, c);
    }

    return c.json(
      {
        success: true,
        data: formatSingle(created, options.formatter?.single),
      },
      201,
    );
  };

  const update = async (c: Context) => {
    let body = await c.req.json();

    if (options.validation?.update) {
      body = options.validation.update.parse(body);
    }

    if (options.hooks?.beforeUpdate) {
      body = await options.hooks.beforeUpdate(body, c);
    }

    const updated = await options.model.update({
      where: {
        uid: c.req.param("id"),
      },
      data: body,
    });

    if (options.hooks?.afterUpdate) {
      await options.hooks.afterUpdate(updated, c);
    }

    return c.json({
      success: true,
      data: formatSingle(updated, options.formatter?.single),
    });
  };

  const destroy = async (c: Context) => {
    await options.model.delete({
      where: {
        uid: c.req.param("id"),
      },
    });

    return c.json({
      success: true,
      message: "Deleted",
    });
  };

  const handlers = {
    index,
    show,
    store,
    update,
    destroy,
  };

  if (!options.disableRoutes?.index) {
    if (options?.permissions?.view) {
      router.use("/", permissionMiddleware(options.permissions.view));
    }
    router.get("/", handlers.index);
  }

  if (!options.disableRoutes?.show) {
    if (options?.permissions?.view) {
      router.use("/:id", permissionMiddleware(options.permissions.view));
    }
    router.get("/:id", handlers.show);
  }

  if (!options.disableRoutes?.store) {
    if (options?.permissions?.create) {
      router.use("/", permissionMiddleware(options.permissions.create));
    }
    router.post("/", handlers.store);
  }

  if (!options.disableRoutes?.update) {
    if (options?.permissions?.update) {
      router.use("/:id", permissionMiddleware(options.permissions.update));
    }
    router.put("/:id", handlers.update);
  }

  if (!options.disableRoutes?.destroy) {
    if (options?.permissions?.delete) {
      router.use("/:id", permissionMiddleware(options.permissions.delete));
    }
    router.delete("/:id", handlers.destroy);
  }

  return { handlers, router };
}
