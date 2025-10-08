import { ilike, inArray, or } from 'drizzle-orm'
import { AnyColumn } from 'drizzle-orm'
import { FilterType } from '../types'

/**
 * Perform text search across multiple columns
 * 
 * @param searchTerm The search term to look for
 * @param columns Array of columns to search in
 * @returns Combined OR condition or undefined if no search term
 * 
 * @example
 * ```ts
 * const where = textSearch('john', [users.name, users.email])
 * db.select().from(users).where(where)
 * ```
 */
export function textSearch(searchTerm: string, columns: AnyColumn[]): any {
  if (!searchTerm?.trim()) return undefined
  
  const searchConditions = columns.map(column => 
    ilike(column, `%${searchTerm.trim()}%`)
  )
  return or(...searchConditions)
}

/**
 * Create an IN filter with type transformation
 * 
 * @param column The column to filter
 * @param values Array of values to match
 * @param type The data type for transformation
 * @returns inArray condition or undefined if no values
 * 
 * @example
 * ```ts
 * const where = inFilter(users.age, [18, 21, 25], 'number')
 * db.select().from(users).where(where)
 * ```
 */
export function inFilter(column: AnyColumn, values: any[], type: FilterType = 'string'): any {
  if (!values?.length) return undefined
  
  const transform = (val: any) => {
    switch (type) {
      case 'number': return Number(val)
      case 'date': return val instanceof Date ? val : new Date(val)
      case 'boolean': return Boolean(val)
      default: return val
    }
  }
  
  return inArray(column, values.map(transform))
}
