# FilterBuilder API

Static class exposing composable helpers to translate validated (or raw) filter objects into Drizzle SQL expressions.

## Overview
```ts
import { FilterBuilder } from 'drizzle-filters'
```
All methods return either a Drizzle `SQL` expression or `undefined` (meaning "no conditions"). Always safe to pass `undefined` into `where()`.

## Methods

### `buildWhere(filterMappings, validate = true)`
Flat AND combination across all mappings. Use for the majority of CRUD endpoints.
```ts
const where = FilterBuilder.buildWhere([
  { filter: { contains: 'john' }, column: users.name, type: 'string' },
  { filter: { gte: 18 }, column: users.age, type: 'number' },
])
```
- Skips null/undefined filter entries silently
- Validates each filter unless `validate` is `false`

### `buildFilterConditions(configs, relation = 'AND', validate = true)`
Adds per-config grouping and top-level relation.
```ts
FilterBuilder.buildFilterConditions([
  { filter: { contains: 'john', startsWith: 'jo' }, column: users.name, type: 'string', relation: 'AND' },
  { filter: { contains: 'john' }, column: users.email, type: 'string', relation: 'OR' },
], 'OR')
```

### `buildNestedFilters(nestedConfigs, globalRelation = 'AND', validate = true)`
Group sets of `FilterConfig[]` objects.
```ts
FilterBuilder.buildNestedFilters([
  { filters: [ { filter: { contains: 'john' }, column: users.name, type: 'string' }, { filter: { contains: 'john' }, column: users.email, type: 'string' } ], relation: 'OR' },
  { filters: [ { filter: { gte: 18 }, column: users.age, type: 'number' }, { filter: { equals: true }, column: users.active, type: 'boolean' } ], relation: 'AND' }
], 'AND')
```

### `validateFilter(filter, type)`
Manually run schema validation and coercion.
```ts
try {
  const valid = FilterBuilder.validateFilter({ contains: 'x' }, 'string')
} catch (e) {
  // Handle Zod error wrapper
}
```

## Error Handling
When validation is enabled, operator or type mismatches throw an `Error` summarizing all Zod issues:
```
Filter validation failed: contains: Expected string
```
Wrap with your transport layer (HTTP 400, GraphQL user error, etc.).

## Performance Notes
- Validation overhead is minimal (single object parse). Disable only if profiling proves necessary.
- Nesting depth mostly impacts Drizzle SQL AST size; typical usage is shallow.

## Patterns
### Conditional Filter Inclusion
```ts
const filters = [] as any[]
if (query.name) filters.push({ filter: { contains: query.name }, column: users.name, type: 'string' })
if (query.minAge) filters.push({ filter: { gte: Number(query.minAge) }, column: users.age, type: 'number' })
const where = FilterBuilder.buildWhere(filters)
```

### Merging with Other Conditions
```ts
const filterWhere = FilterBuilder.buildWhere([...])
return db.select().from(users).where(and(eq(users.tenantId, tenantId), filterWhere))
```

### Using Nested `not`
```ts
FilterBuilder.buildWhere([
  { filter: { not: { contains: 'spam' } }, column: users.email, type: 'string' }
])
```
