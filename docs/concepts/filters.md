# Filter Objects

A filter object represents constraints applied to a single column. Each filter is a plain object whose keys are operators (e.g. `equals`, `contains`, `gte`). Different data types support different operator sets.

## Supported Data Types
- `string`
- `number`
- `date` (strings & timestamps are coerced to `Date` via Zod)
- `boolean`

## Example Shapes
```ts
// String
{ contains: 'john', startsWith: 'J', notIn: ['spam'] }

// Number
{ gte: 18, lte: 65, not: 0 }

// Date
{ gte: '2024-01-01', lt: '2025-01-01' }

// Boolean
{ equals: true }
```

## Null Semantics
Use `isNull: true` or `isNotNull: true`. These are explicit; `equals: null` is not used—keeping intent clear.

```ts
{ isNull: true }      // column IS NULL
{ isNotNull: true }   // column IS NOT NULL
```

## Recursive `not`
`not` can take either a primitive value OR another filter object of the same type, allowing deep logical negation.

```ts
// Equivalent to NOT (name ILIKE '%spam%')
{ not: { contains: 'spam' } }

// Equivalent to NOT ( NOT (name = 'admin') ) -> cancels out
{ not: { not: { equals: 'admin' } } }
```

## Validation Layer
Each filter object is parsed by a Zod schema (unless validation is disabled). This: 
- Coerces date strings
- Enforces operator key correctness (no silent typos)
- Produces aggregate error messages

## When to Disable Validation
Disable only when:
- Filters come from trusted internal code paths
- Performance micro-optimization is necessary (parsing overhead is tiny for most cases)

```ts
FilterBuilder.buildWhere([{ filter: { contains: 'x' }, column: users.name, type: 'string' }], false)
```

## Best Practices
- Keep filter schema separate from business DTOs
- Use explicit allow-lists per endpoint instead of reusing huge generic schemas
- Return structured API errors for invalid filters
- Document which fields are filterable in external APIs
