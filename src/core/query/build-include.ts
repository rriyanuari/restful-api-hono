export function buildInclude(include?: string) {
  if (!include) return undefined

  const relations = include.split(',')

  const result: any = {}

  for (const relation of relations) {
    const nested = relation.split('.')

    let current = result

    nested.forEach((key, index) => {
      if (!current[key]) {
        current[key] = {}
      }

      if (index === nested.length - 1) {
        current[key] = true
      } else {
        current[key].include = current[key].include || {}
        current = current[key].include
      }
    })
  }

  return result
}