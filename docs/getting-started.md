# Getting Started

This guide walks you through installing and using `drizzle-filters` in a typical Drizzle + TypeScript project.

## Installation

Install the package plus its expected peer dependencies:

```bash
npm install drizzle-filters drizzle-orm zod
```

### Node / TypeScript Requirements
- TypeScript 5.x recommended (tested) – 4.9+ should work.
- ES Modules or CommonJS both supported (the package ships ESM; bundlers handle CJS consumption).
- Drizzle ORM ^0.30 (other versions may work but not officially verified).

## Quick Minimal Example

```ts
import { z } from 'zod'
import { FilterBuilder, stringFilterSchema, numberFilterSchema } from 'drizzle-filters'
import { users } from './schema'

// 1. Build a validation schema for inbound filters
const userFilterSchema = z.object({
  name: stringFilterSchema,
  age: numberFilterSchema,
})

// 2. Validate + build WHERE condition
export function listUsers(rawFilters: unknown) {
  const parsed = userFilterSchema.parse(rawFilters)
  const where = FilterBuilder.buildWhere([
    { filter: parsed.name, column: users.name, type: 'string' },
    { filter: parsed.age, column: users.age, type: 'number' },
  ])
  return db.select().from(users).where(where)
}

// 3. Call
listUsers({ name: { contains: 'john' }, age: { gte: 18 } })
```

## Choosing an API Method
| Use Case | Method |
|----------|--------|
| Flat AND combination of simple filters | `FilterBuilder.buildWhere` |
| Mixed operators per column with per-column AND/OR grouping | `FilterBuilder.buildFilterConditions` |
| Complex groupings ( (A OR B) AND (C AND D) ) | `FilterBuilder.buildNestedFilters` |

## Feature Overview
- Type-safe operator objects
- Zod validation (toggleable) for runtime safety
- Recursive `not` support for advanced negation
- Text search convenience (`textSearch`)
- `inFilter` utility for coerced `IN` queries

## Disabling Validation
Validation is on by default. For internal/trusted calls you can disable it:

```ts
FilterBuilder.buildWhere([
  { filter: { contains: 'x' }, column: users.name, type: 'string' }
], false) // second arg = validate
```

## Error Messages
Invalid filters throw helpful errors aggregated from Zod:
```
Filter validation failed: contains: Expected string, in: Expected array of numbers
```
Use try/catch in API layers to convert into HTTP 400 responses.

## Next Steps
- Read about [Filters & Shape](./concepts/filters.md)
- Explore all [Operators](./concepts/operators.md)
- Dive into [FilterBuilder API](./api/filter-builder.md)
- See [Real-world Patterns](./guides/building-nested-filters.md)
