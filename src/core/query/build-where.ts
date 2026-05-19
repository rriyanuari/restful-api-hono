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

export function buildWhere(query: Record<string, any>) {
  const where: any = {}

  Object.entries(query).forEach(([key, value]) => {
    if (
      [
        'page',
        'limit',
        'sortby',
        'sortmode',
        'include',
      ].includes(key)
    ) {
      return
    }

    const [field, operator] = key.split(':')

    if (operator) {
      where[field] = {
        [operators[operator] || operator]: value,
      }
    } else {
      where[field] = value
    }
  })

  return where
}