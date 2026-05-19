function camelToSnake(str: string) {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)
}

export function buildOrderBy(query: Record<string, any>) {
  const sortBy = camelToSnake(query.sortby || 'createdAt')

  return {
    [sortBy]: query.sortmode || 'desc',
  }
}