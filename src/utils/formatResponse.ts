export function formatSingle(
  data: any,
  formatter?: (data: any) => any,
) {
  if (!formatter) return data

  return formatter(data)
}

export function formatMany(
  data: any[],
  formatter?: (data: any[]) => any,
) {
  if (!formatter) return data

  return formatter(data)
}