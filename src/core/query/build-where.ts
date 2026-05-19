const operators: Record<string, string> = {
  contains: 'contains',
  startsWith: 'startsWith',
  endsWith: 'endsWith',
  gt: 'gt',
  gte: 'gte',
  lt: 'lt',
  lte: 'lte',
  not: 'not',
}

const reservedQueryKeys = new Set([
  'page',
  'limit',
  'sortby',
  'sortmode',
  'include',
])

function isPlainObject(value: unknown): value is Record<string, any> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function parseQueryKey(key: string) {
  const separatorIndex = key.lastIndexOf(':')

  if (separatorIndex === -1) {
    return {
      fieldPath: key,
      operator: undefined,
    }
  }

  return {
    fieldPath: key.slice(0, separatorIndex),
    operator: key.slice(separatorIndex + 1),
  }
}

function assignWhereValue(
  target: Record<string, any>,
  fieldPath: string,
  value: any,
  operator?: string,
) {
  const path = fieldPath.split('.')
  let current = target

  path.forEach((segment, index) => {
    const isLeaf = index === path.length - 1

    if (isLeaf) {
      if (!operator) {
        current[segment] = value
        return
      }

      const prismaOperator = operators[operator] || operator
      const existing = current[segment]

      current[segment] = isPlainObject(existing)
        ? {
            ...existing,
            [prismaOperator]: value,
          }
        : {
            [prismaOperator]: value,
          }

      return
    }

    if (!isPlainObject(current[segment])) {
      current[segment] = {}
    }

    current = current[segment]
  })
}

export function buildWhere(query: Record<string, any>) {
  const where: any = {}

  Object.entries(query).forEach(([key, value]) => {
    if (reservedQueryKeys.has(key)) {
      return
    }

    const { fieldPath, operator } = parseQueryKey(key)

    assignWhereValue(where, fieldPath, value, operator)
  })

  return where
}
