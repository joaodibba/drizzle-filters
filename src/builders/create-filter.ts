import { and, or, not, getTableColumns, Column, SQL, Table } from 'drizzle-orm'
import { z } from 'zod'
import {
  stringFilterSchema,
  numberFilterSchema,
  dateFilterSchema,
  booleanFilterSchema,
  StringFilter,
  NumberFilter,
  DateFilter,
  BooleanFilter,
} from '../schemas'
import { FilterType } from '../types'
import { FilterBuilder } from './filter-builder'

type ColumnFilter<C> = C extends Column
  ? C['_']['dataType'] extends 'string' | `string ${string}` ? StringFilter
  : C['_']['dataType'] extends 'number' | `number ${string}` ? NumberFilter
  : C['_']['dataType'] extends 'date' | 'object date' ? DateFilter
  : C['_']['dataType'] extends 'boolean' ? BooleanFilter
  : never
  : never

type FilterableKeys<T extends Table> = {
  [K in keyof T['_']['columns']]: ColumnFilter<T['_']['columns'][K]> extends never ? never : K
}[keyof T['_']['columns']] & string

export type WhereInput<T extends Table, K extends FilterableKeys<T> = FilterableKeys<T>> = {
  [P in K]?: ColumnFilter<T['_']['columns'][P]>
} & {
  AND?: WhereInput<T, K>[]
  OR?: WhereInput<T, K>[]
  NOT?: WhereInput<T, K>
}

const schemas = {
  string: stringFilterSchema,
  number: numberFilterSchema,
  date: dateFilterSchema,
  boolean: booleanFilterSchema,
}

const filterTypeOf = (dataType: string): FilterType | undefined =>
  dataType === 'date' || dataType === 'object date'
    ? 'date'
    : (['string', 'number', 'boolean'] as const).find(t => dataType === t || dataType.startsWith(`${t} `))

export function createFilter<T extends Table, K extends FilterableKeys<T> = FilterableKeys<T>>(
  table: T,
  options: { allow?: readonly K[] } = {},
) {
  const columns = getTableColumns(table) as Record<string, Column>
  const fields: Record<string, { column: Column; type: FilterType }> = {}

  for (const key of options.allow ?? Object.keys(columns)) {
    const column = columns[key]
    if (!column) throw new Error(`createFilter: unknown column "${key}"`)
    const type = filterTypeOf(column.dataType)
    if (type) fields[key] = { column, type }
    else if (options.allow) throw new Error(`createFilter: column "${key}" has unsupported type "${column.dataType}"`)
  }

  const schema: z.ZodType<WhereInput<T, K>> = z.lazy(() =>
    z.object({
      ...Object.fromEntries(Object.entries(fields).map(([key, f]) => [key, schemas[f.type]])),
      AND: z.array(schema).optional(),
      OR: z.array(schema).optional(),
      NOT: schema.optional(),
    }).strict(),
  ) as any

  const build = (input: WhereInput<T, K>): SQL | undefined => {
    const parts: (SQL | undefined)[] = []
    for (const [key, value] of Object.entries(input)) {
      if (value === undefined) continue
      if (key === 'AND') parts.push(and(...(value as WhereInput<T, K>[]).map(build)))
      else if (key === 'OR') parts.push(or(...(value as WhereInput<T, K>[]).map(build)))
      else if (key === 'NOT') {
        const inner = build(value as WhereInput<T, K>)
        if (inner) parts.push(not(inner))
      } else {
        const f = fields[key]
        parts.push(and(...FilterBuilder.buildSingleFilter(value as any, f.column, f.type, false)))
      }
    }
    return and(...parts)
  }

  return {
    schema,
    toWhere: (input: unknown) => build(schema.parse(input)),
  }
}
