# Examples

Collection of scenarios derived from tests and real-world usage.

## Basic Name Contains
```ts
FilterBuilder.buildWhere([
  { filter: { contains: 'john' }, column: users.name, type: 'string' }
])
```

## Age Range + Active Flag
```ts
FilterBuilder.buildWhere([
  { filter: { gte: 18, lte: 65 }, column: users.age, type: 'number' },
  { filter: { equals: true }, column: users.active, type: 'boolean' },
])
```

## Text Search + Additional Filters
```ts
const search = textSearch('john', [users.name, users.email])
const where = FilterBuilder.buildWhere([
  { filter: { gte: 18 }, column: users.age, type: 'number' }
])
const final = search ? and(search, where) : where
```

## Excluding IDs
```ts
FilterBuilder.buildWhere([
  { filter: { notIn: [1, 2, 3] }, column: users.id, type: 'number' }
])
```

## Null Email
```ts
FilterBuilder.buildWhere([
  { filter: { isNull: true }, column: users.email, type: 'string' }
])
```

## Nested NOT
```ts
FilterBuilder.buildWhere([
  { filter: { not: { contains: 'spam' } }, column: users.email, type: 'string' }
], false)
```

## Multi-Field OR + Constraints
```ts
const searchGroup = FilterBuilder.buildFilterConditions([
  { filter: { contains: 'john' }, column: users.name, type: 'string' },
  { filter: { contains: 'john' }, column: users.email, type: 'string' }
], 'OR')

const final = FilterBuilder.buildFilterConditions([
  { filter: { equals: true }, column: users.active, type: 'boolean' },
  { filter: { gte: 18 }, column: users.age, type: 'number' },
])
```

## Combined Nested Filters
```ts
FilterBuilder.buildNestedFilters([
  {
    filters: [
      { filter: { contains: 'john' }, column: users.name, type: 'string' },
      { filter: { contains: 'john' }, column: users.email, type: 'string' },
    ],
    relation: 'OR'
  },
  {
    filters: [
      { filter: { gte: 18 }, column: users.age, type: 'number' },
      { filter: { equals: true }, column: users.active, type: 'boolean' },
    ],
    relation: 'AND'
  }
], 'AND')
```
