import { AnyColumn, SQL, is, sql } from 'drizzle-orm'
import { PgColumn } from 'drizzle-orm/pg-core'

export const escapeLike = (value: string) => value.replace(/[!%_]/g, '!$&')

export function likeInsensitive(column: AnyColumn, pattern: string): SQL {
  return is(column, PgColumn)
    ? sql`${column} ilike ${pattern} escape '!'`
    : sql`lower(${column}) like ${pattern.toLowerCase()} escape '!'`
}
