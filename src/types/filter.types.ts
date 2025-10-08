import { AnyColumn } from 'drizzle-orm'
import { StringFilter, NumberFilter, DateFilter, BooleanFilter } from '../schemas'

/**
 * Available filter operators
 */
export type FilterOperators = 
  | 'equals' 
  | 'not' 
  | 'lt' 
  | 'lte' 
  | 'gt' 
  | 'gte' 
  | 'in' 
  | 'notIn' 
  | 'contains' 
  | 'startsWith' 
  | 'endsWith' 
  | 'isNull' 
  | 'isNotNull'

/**
 * Supported filter data types
 */
export type FilterType = 'string' | 'number' | 'date' | 'boolean'

/**
 * Relation type for combining filters
 */
export type RelationType = 'AND' | 'OR'

/**
 * Union type for all filter types
 */
export type FilterValue = StringFilter | NumberFilter | DateFilter | BooleanFilter | null | undefined

/**
 * Nested filter type for recursive 'not' operations
 */
export type NestedFilter = {
  not?: FilterValue
} & FilterValue

/**
 * Configuration for a single filter
 */
export interface FilterConfig {
  column: AnyColumn
  filter: FilterValue
  type?: FilterType
  relation?: RelationType
}

/**
 * Configuration for nested filter groups
 */
export interface NestedFilterConfig {
  filters: FilterConfig[]
  relation?: RelationType
}

/**
 * Simplified filter mapping for common use cases
 */
export interface FilterMapping {
  filter: FilterValue
  column: AnyColumn
  type?: FilterType
}
