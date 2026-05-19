export function buildPagination(query: Record<string, any>) {
  const page = Math.max(Number(query.page || 1), 1)
  const limit = Math.max(Number(query.limit || 10), 1)

  return {
    page,
    limit,
    skip: (page - 1) * limit,
    take: limit,
  }
}