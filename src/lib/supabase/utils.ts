/**
 * Resolves a Supabase relation that could be returned as either a single object (for N:1 joins)
 * or an array of objects (for 1:N joins or depending on PostgREST version/configuration).
 */
export function resolveRelation<T>(
  relation: T | T[] | null | undefined,
  fallbackValue: T,
): T {
  if (!relation) return fallbackValue;
  if (Array.isArray(relation)) return relation[0] ?? fallbackValue;
  return relation;
}
