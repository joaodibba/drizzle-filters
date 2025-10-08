import { z } from 'zod'

/**
 * Base filter operators schema
 * Defines all possible filter operations
 */
const filterOperatorSchema = z.object({
  equals: z.any().optional(),
  not: z.any().optional(),
  lt: z.any().optional(),
  lte: z.any().optional(),
  gt: z.any().optional(),
  gte: z.any().optional(),
  in: z.array(z.any()).optional(),
  notIn: z.array(z.any()).optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  isNull: z.boolean().optional(),
  isNotNull: z.boolean().optional(),
}).strict()

/**
 * Recursive schema for nested 'not' filters
 */
type FilterOperator = z.infer<typeof filterOperatorSchema> & {
  not?: FilterOperator
}

export const filterOperatorRecursive: z.ZodType<FilterOperator> = filterOperatorSchema.extend({
  not: z.lazy(() => filterOperatorRecursive).optional()
})

export type { FilterOperator }
