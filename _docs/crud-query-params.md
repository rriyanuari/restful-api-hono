# CRUD Query Parameters

This document describes the query parameters supported by routers created with [`buildCrudRouter`](../src/core/crud/build-crud-router.ts).

## Supported routes

### `GET /resource`

Supports:

- pagination
- sorting
- filtering
- relation `include`

### `GET /resource/:id`

Supports:

- relation `include`

### `POST`, `PUT`, `DELETE`

These routes do not use query params for filtering or pagination.

## Reserved query params

These keys are handled by the CRUD generator and are not treated as filters:

| Param | Type | Default | Notes |
| --- | --- | --- | --- |
| `page` | number | `1` | Minimum value is `1` |
| `limit` | number | `10` | Minimum value is `1` |
| `sortby` | string | `createdAt` | Camel case is converted to snake case before Prisma `orderBy` |
| `sortmode` | string | `desc` | Usually `asc` or `desc` |
| `include` | string | - | Comma-separated relations, supports dot notation for nested includes |

## Pagination

Pagination is built by [`buildPagination`](../src/core/query/build-pagination.ts).

Example:

```http
GET /api/v1/users?page=2&limit=20
```

Generated Prisma options:

```ts
{
  skip: 20,
  take: 20
}
```

Response shape from the index route:

```json
{
  "success": true,
  "data": [],
  "meta": {
    "total": 42,
    "page": 2,
    "limit": 20
  }
}
```

## Sorting

Sorting is built by [`buildOrderBy`](../src/core/query/build-order-by.ts).

Example:

```http
GET /api/v1/users?sortby=name&sortmode=asc
```

Generated Prisma options:

```ts
{
  orderBy: {
    name: "asc"
  }
}
```

Camel case is converted to snake case:

```http
GET /api/v1/users?sortby=createdAt&sortmode=desc
```

Becomes:

```ts
{
  orderBy: {
    created_at: "desc"
  }
}
```

## Filtering

Filtering is built by [`buildWhere`](../src/core/query/build-where.ts).

Any query param that is not one of the reserved keys becomes part of Prisma `where`.

### Exact match

```http
GET /api/v1/users?email=john@example.com
```

Becomes:

```ts
{
  where: {
    email: "john@example.com"
  }
}
```

### Operator syntax

Use this format:

```text
field:operator=value
```

Example:

```http
GET /api/v1/users?email:contains=gmail.com
```

Becomes:

```ts
{
  where: {
    email: {
      contains: "gmail.com"
    }
  }
}
```

### Supported operators

These operators are explicitly mapped in the helper:

| Query operator | Prisma operator |
| --- | --- |
| `contains` | `contains` |
| `startsWith` | `startsWith` |
| `endsWith` | `endsWith` |
| `gt` | `gt` |
| `gte` | `gte` |
| `lt` | `lt` |
| `lte` | `lte` |
| `not` | `not` |

Unknown operator names are passed through as-is. That means Prisma operators such as `equals` can also work if Prisma accepts them:

```http
GET /api/v1/users?name:equals=John
```

### Nested relation filtering

Dot notation builds nested Prisma `where` objects.

Example:

```http
GET /api/v1/users?userTokens.some.token_type=refresh
```

Becomes:

```ts
{
  where: {
    userTokens: {
      some: {
        token_type: "refresh"
      }
    }
  }
}
```

The same operator syntax works on nested fields:

```http
GET /api/v1/users?userTokens.some.device_type:contains=mobile
```

Becomes:

```ts
{
  where: {
    userTokens: {
      some: {
        device_type: {
          contains: "mobile"
        }
      }
    }
  }
}
```

This is useful for Prisma relation filters such as:

- `some`
- `every`
- `none`
- `is`
- `isNot`

## Include relations

Include is built by [`buildInclude`](../src/core/query/build-include.ts).

### Single relation

```http
GET /api/v1/users?include=userTokens
```

Becomes:

```ts
{
  include: {
    userTokens: true
  }
}
```

### Nested relation

Dot notation builds nested Prisma includes:

```http
GET /api/v1/posts?include=author.profile,comments.user
```

Becomes:

```ts
{
  include: {
    author: {
      include: {
        profile: true
      }
    },
    comments: {
      include: {
        user: true
      }
    }
  }
}
```

For the current `User` module in this project, the practical include example is:

```http
GET /api/v1/users?include=userTokens
```

## Real examples for `/api/v1/users`

### First page with default limit

```http
GET /api/v1/users
```

### Custom page and limit

```http
GET /api/v1/users?page=3&limit=5
```

### Sort by newest updated record

```http
GET /api/v1/users?sortby=updatedAt&sortmode=desc
```

### Filter by exact name

```http
GET /api/v1/users?name=Riyan
```

### Filter by partial email

```http
GET /api/v1/users?email:contains=@gmail.com
```

### Load user tokens together with users

```http
GET /api/v1/users?include=userTokens
```

### Combine pagination, sorting, filtering, and include

```http
GET /api/v1/users?page=1&limit=10&sortby=name&sortmode=asc&email:contains=@gmail.com&include=userTokens
```

### Filter users by relation data and include the relation

```http
GET /api/v1/users?include=userTokens&userTokens.some.token_type=refresh
```

## Important behavior and limits

### 1. Filter keys must use Prisma field names

Filtering uses the raw field name from the query string.

Use Prisma model fields, not formatter output fields.

For `User`, use:

- `uid`, not `uuid`
- `created_at`, not `createdAt`
- `updated_at`, not `updatedAt`
- `deleted_at`, not `deletedAt`

This matters because the response formatter in [`src/modules/user/user.format.ts`](../src/modules/user/user.format.ts) renames fields only for output.

### 2. Query values stay as strings

`c.req.query()` returns string values, and the helper does not cast them.

That means:

- string filters work as expected
- date and numeric filters depend on what Prisma accepts for that field
- there is no automatic boolean, number, or date parsing in the helper

### 3. Multiple operators on the same field are merged

Current implementation merges operators on the same field.

Example:

```http
GET /api/v1/users?created_at:gte=2026-01-01&created_at:lte=2026-12-31
```

Becomes:

```ts
{
  where: {
    created_at: {
      gte: "2026-01-01",
      lte: "2026-12-31"
    }
  }
}
```

### 4. Multiple filters are combined in the same `where` object

Different filter fields are combined in the same `where` object.

Example:

```http
GET /api/v1/users?name=Riyan&email:contains=@gmail.com
```

Becomes:

```ts
{
  where: {
    name: "Riyan",
    email: {
      contains: "@gmail.com"
    }
  }
}
```

### 5. No built-in `OR` / `AND` group builder

The helper supports nested object paths, but it does not provide a query-string format for Prisma array groups such as `OR` and `AND`.

### 6. `useUserScope` adds an extra filter

If a CRUD router is created with `useUserScope: true`, the generator adds:

```ts
where.userId = currentUser.id
```

That happens after the base query params are built.
