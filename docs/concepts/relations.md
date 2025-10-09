# Relations & Grouping

Filtering often requires combining multiple field constraints with logical AND/OR. `drizzle-filters` offers three layers of composition.

## 1. Flat Composition: `buildWhere`
Simplest form: every condition combined with AND.
```ts
FilterBuilder.buildWhere([
  { filter: { contains: 'john' }, column: users.name, type: 'string' },
  { filter: { gte: 18 }, column: users.age, type: 'number' },
]) // (name ILIKE '%john%') AND (age >= 18)
```

## 2. Per-Column Group Logic: `buildFilterConditions`
Each filter object can contain several operators; you decide whether they AND or OR together by the `relation` property in each config.
```ts
FilterBuilder.buildFilterConditions([
  { filter: { contains: 'john', startsWith: 'jo' }, column: users.name, type: 'string', relation: 'AND' },
  { filter: { contains: 'john' }, column: users.email, type: 'string', relation: 'OR' }
], 'OR')
// ( (name ILIKE '%john%' AND name ILIKE 'jo%') ) OR ( (email ILIKE '%john%') )
```

## 3. Nested Grouping: `buildNestedFilters`
Compose groups produced by layer (2) and then combine those groups.
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
// ( (name ILIKE '%john%' OR email ILIKE '%john%') ) AND ( (age >= 18 AND active = true) )
```

## Nested Negation
Use nested `not` inside individual filters for targeted logic:
```ts
{ not: { contains: 'spam' } } // NOT (col ILIKE '%spam%')
```

## When to Escalate Abstraction
| Scenario | Recommended API |
|----------|-----------------|
| Simple list endpoint | `buildWhere` |
| Multiple text fields OR + extra numeric ranges | `buildFilterConditions` |
| Complex search pages (groups) | `buildNestedFilters` |

## Gotchas
- Empty filters return `undefined` (you should safely pass this to `.where()` — Drizzle ignores `undefined`).
- Passing an empty array of configs yields `undefined` – treat as no-op.
- Deeply nested `not` chains are supported but can be harder to reason about; prefer small logical groups.
