/**
 * drizzle-filters - Type-safe filtering for Drizzle ORM with Zod validation
 * 
 * A Prisma-like filter API for Drizzle ORM that provides:
 * - Type-safe filter operations
 * - Zod schema validation
 * - Nested filter support
 * - Complex AND/OR combinations
 * 
 * @packageDocumentation
 */

// Export all schemas
export {
  // Typed filter schemas
  stringFilterSchema,
  numberFilterSchema,
  dateFilterSchema,
  booleanFilterSchema,
  // Base operator schema
  filterOperatorRecursive,
  // Schema types
  type StringFilter,
  type NumberFilter,
  type DateFilter,
  type BooleanFilter,
  type FilterOperator,
} from './schemas'

// Export all types
export {
  type FilterOperators,
  type FilterType,
  type RelationType,
  type FilterConfig,
  type NestedFilterConfig,
  type FilterMapping,
  type FilterValue,
} from './types'

// Export builders
export { FilterBuilder } from './builders'

// Export utilities
export { textSearch, inFilter } from './utils'
