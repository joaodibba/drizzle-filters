import { and, or, eq, ne, lt, lte, gt, gte, inArray, not, ilike, isNull, isNotNull, SQL } from 'drizzle-orm'
import { AnyColumn } from 'drizzle-orm'
import { z } from 'zod'
import { 
  stringFilterSchema, 
  numberFilterSchema, 
  dateFilterSchema, 
  booleanFilterSchema 
} from '../schemas'
import { 
  FilterType, 
  FilterOperators, 
  FilterConfig, 
  NestedFilterConfig, 
  RelationType, 
  FilterMapping,
  FilterValue
} from '../types'

/**
 * FilterBuilder - Main class for building type-safe Drizzle ORM filters
 * 
 * Provides methods to:
 * - Validate filters using Zod schemas
 * - Build single and multiple filter conditions
 * - Combine filters with AND/OR logic
 * - Handle nested filter groups
 */
export class FilterBuilder {
  
  /**
   * Validate filter input using Zod schema
   * 
   * @param filter The filter object to validate
   * @param type The data type determines which schema to use
   * @returns Validated filter or throws ZodError
   */
  static validateFilter(filter: FilterValue, type: FilterType = 'string'): FilterValue {
    if (!filter) return filter
    
    const schemas = {
      string: stringFilterSchema,
      number: numberFilterSchema,
      date: dateFilterSchema,
      boolean: booleanFilterSchema
    }
    
    const schema = schemas[type]
    return schema.parse(filter)
  }

  /**
   * Build conditions for a single filter object
   * 
   * @param filter The filter object
   * @param column The database column to apply the filter on
   * @param type The data type of the column
   * @param validate Whether to validate the filter with Zod (default true)
   * @returns Array of conditions to be combined with AND/OR
   */
  private static buildSingleFilter(
    filter: FilterValue, 
    column: AnyColumn, 
    type: FilterType = 'string',
    validate: boolean = true
  ): SQL<unknown>[] {
    if (!filter) return []
    
    // At this point, filter is not null/undefined
    const validFilter = filter as NonNullable<FilterValue>
    
    // Validate filter if requested
    if (validate) {
      try {
        filter = this.validateFilter(validFilter, type)
      } catch (error) {
        if (error instanceof z.ZodError) {
          const errorMessages = error.errors?.map(e => `${e.path.join('.')}: ${e.message}`).join(', ') || 'Unknown validation error'
          throw new Error(`Filter validation failed: ${errorMessages}`)
        }
        const errorMessage = error instanceof Error ? error.message : String(error)
        throw new Error(`Filter validation failed: ${errorMessage}`)
      }
    }
    
    const conditions: SQL<unknown>[] = []
    
    // Transform function based on type
    const transform = (val: any) => {
      if (val === null || val === undefined)
        return val
      switch (type) {
        case 'number':
          return typeof val === 'string' ? Number(val) : val
        case 'date':
          return val instanceof Date ? val : new Date(val)
        case 'boolean':
          return typeof val === 'string' ? val === 'true' : Boolean(val)
        default:
          return val
      }
    }

    // Handle nested 'not' filter recursively
    if (validFilter.not !== undefined && typeof validFilter.not === 'object') {
      const notConditions = this.buildSingleFilter(validFilter.not as FilterValue, column, type, false)
      if (notConditions.length > 0) {
        const combined = and(...notConditions)
        if (combined) {
          conditions.push(not(combined))
        }
      }
      return conditions
    }

    // Standard operators
    const operators: Record<FilterOperators, (val: any) => any> = {
      equals: (val: any) => eq(column, transform(val)),
      not: (val: any) => ne(column, transform(val)),
      lt: (val: any) => lt(column, transform(val)),
      lte: (val: any) => lte(column, transform(val)),
      gt: (val: any) => gt(column, transform(val)),
      gte: (val: any) => gte(column, transform(val)),
      in: (val: any) => {
        const values = Array.isArray(val) ? val.map(transform) : [transform(val)]
        return inArray(column, values)
      },
      notIn: (val: any) => {
        const values = Array.isArray(val) ? val.map(transform) : [transform(val)]
        return not(inArray(column, values))
      },
      contains: (val: any) => type === 'string' ? ilike(column, `%${val}%`) : eq(column, transform(val)),
      startsWith: (val: any) => type === 'string' ? ilike(column, `${val}%`) : eq(column, transform(val)),
      endsWith: (val: any) => type === 'string' ? ilike(column, `%${val}`) : eq(column, transform(val)),
      isNull: (val: boolean) => val ? isNull(column) : isNotNull(column),
      isNotNull: (val: boolean) => val ? isNotNull(column) : isNull(column)
    }

    // Apply all present operators
    Object.entries(operators).forEach(([op, fn]) => {
      const key = op as FilterOperators
      const filterRecord = validFilter as Record<string, any>
      if (filterRecord[key] !== undefined && (typeof validFilter.not !== 'object' || op !== 'not')) {
        conditions.push(fn(filterRecord[key]))
      }
    })

    return conditions
  }

  /**
   * Build conditions for multiple filters with specified relation (AND/OR)
   * 
   * @param configs Array of filter configurations
   * @param relation How to combine the different filter configs (default AND)
   * @param validate Whether to validate filters with Zod (default true)
   * @returns Combined condition or undefined if no conditions
   */
  static buildFilterConditions(
    configs: FilterConfig[], 
    relation: RelationType = 'AND',
    validate: boolean = true
  ) {
    const allConditions = []

    for (const config of configs) {
      const conditions = this.buildSingleFilter(config.filter, config.column, config.type, validate)
      
      if (conditions.length > 0) {
        const combined = config.relation === 'OR' ? or(...conditions) : and(...conditions)
        allConditions.push(combined)
      }
    }

    if (allConditions.length === 0) return undefined

    return relation === 'OR' ? or(...allConditions) : and(...allConditions)
  }

  /**
   * Build nested filter groups (useful for complex OR/AND combinations)
   * 
   * @param nestedConfigs Array of nested filter configurations
   * @param globalRelation How to combine the different groups (default AND)
   * @param validate Whether to validate filters with Zod (default true)
   * @returns Combined condition or undefined if no conditions
   */
  static buildNestedFilters(
    nestedConfigs: NestedFilterConfig[], 
    globalRelation: RelationType = 'AND',
    validate: boolean = true
  ) {
    const groupConditions = []

    for (const nestedConfig of nestedConfigs) {
      const condition = this.buildFilterConditions(nestedConfig.filters, nestedConfig.relation, validate)
      if (condition) {
        groupConditions.push(condition)
      }
    }

    if (groupConditions.length === 0) return undefined
    
    return globalRelation === 'OR' ? or(...groupConditions) : and(...groupConditions)
  }

  /**
   * Simplified method for common use cases
   * 
   * @param filterMappings Array of filter mappings
   * @param validate Whether to validate filters with Zod (default true)
   * @returns Combined condition or undefined if no conditions
   */
  static buildWhere(
    filterMappings: FilterMapping[],
    validate: boolean = true
  ) {
    const conditions = []

    for (const mapping of filterMappings) {
      if (!mapping.filter)
        continue
      const filterConditions = this.buildSingleFilter(
        mapping.filter, 
        mapping.column, 
        mapping.type || 'string',
        validate
      )
      conditions.push(...filterConditions)
    }

    return conditions.length > 0 ? and(...conditions) : undefined
  }
}
