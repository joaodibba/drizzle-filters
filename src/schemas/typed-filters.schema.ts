import { z } from 'zod'

/**
 * String filter schema
 * Supports equality, negation, array operations, and text search
 * The 'not' field can be either a string value OR a nested filter object
 */
export const stringFilterSchema: z.ZodType<StringFilter | undefined> = z.lazy(() => 
  z.object({
    equals: z.string().optional(),
    not: z.union([z.string(), stringFilterSchema]).optional(),
    in: z.array(z.string()).optional(),
    notIn: z.array(z.string()).optional(),
    contains: z.string().optional(),
    startsWith: z.string().optional(),
    endsWith: z.string().optional(),
    isNull: z.boolean().optional(),
    isNotNull: z.boolean().optional(),
  }).strict().optional()
)

/**
 * Number filter schema
 * Supports equality, comparison, and range operations
 * The 'not' field can be either a number value OR a nested filter object
 */
export const numberFilterSchema: z.ZodType<NumberFilter | undefined> = z.lazy(() => 
  z.object({
    equals: z.number().optional(),
    not: z.union([z.number(), numberFilterSchema]).optional(),
    lt: z.number().optional(),
    lte: z.number().optional(),
    gt: z.number().optional(),
    gte: z.number().optional(),
    in: z.array(z.number()).optional(),
    notIn: z.array(z.number()).optional(),
    isNull: z.boolean().optional(),
    isNotNull: z.boolean().optional(),
  }).strict().optional()
)

/**
 * Date filter schema
 * Supports date comparison with automatic coercion
 * The 'not' field can be either a date value OR a nested filter object
 */
export const dateFilterSchema: z.ZodType<DateFilter | undefined> = z.lazy(() => 
  z.object({
    equals: z.coerce.date().optional(),
    not: z.union([z.coerce.date(), dateFilterSchema]).optional(),
    lt: z.coerce.date().optional(),
    lte: z.coerce.date().optional(),
    gt: z.coerce.date().optional(),
    gte: z.coerce.date().optional(),
    in: z.array(z.coerce.date()).optional(),
    notIn: z.array(z.coerce.date()).optional(),
    isNull: z.boolean().optional(),
    isNotNull: z.boolean().optional(),
  }).strict().optional()
)

/**
 * Boolean filter schema
 * Supports equality and null checks
 * The 'not' field can be either a boolean value OR a nested filter object
 */
export const booleanFilterSchema: z.ZodType<BooleanFilter | undefined> = z.lazy(() => 
  z.object({
    equals: z.boolean().optional(),
    not: z.union([z.boolean(), booleanFilterSchema]).optional(),
    isNull: z.boolean().optional(),
    isNotNull: z.boolean().optional(),
  }).strict().optional()
)

// Export inferred types with proper recursive structure
export type StringFilter = {
  equals?: string
  not?: string | StringFilter
  in?: string[]
  notIn?: string[]
  contains?: string
  startsWith?: string
  endsWith?: string
  isNull?: boolean
  isNotNull?: boolean
}

export type NumberFilter = {
  equals?: number
  not?: number | NumberFilter
  lt?: number
  lte?: number
  gt?: number
  gte?: number
  in?: number[]
  notIn?: number[]
  isNull?: boolean
  isNotNull?: boolean
}

export type DateFilter = {
  equals?: Date
  not?: Date | DateFilter
  lt?: Date
  lte?: Date
  gt?: Date
  gte?: Date
  in?: Date[]
  notIn?: Date[]
  isNull?: boolean
  isNotNull?: boolean
}

export type BooleanFilter = {
  equals?: boolean
  not?: boolean | BooleanFilter
  isNull?: boolean
  isNotNull?: boolean
}

