# Building Nested Filters

Complex search pages often need combinations like:
```
( name CONTAINS 'john' OR email CONTAINS 'john' )
AND ( age >= 18 AND active = true )
```

## Step 1: Build Each Group
```ts
const identityGroup = {
  filters: [
    { filter: { contains: 'john' }, column: users.name, type: 'string' },
    { filter: { contains: 'john' }, column: users.email, type: 'string' },
  ],
  relation: 'OR'
}

const statusGroup = {
  filters: [
    { filter: { gte: 18 }, column: users.age, type: 'number' },
    { filter: { equals: true }, column: users.active, type: 'boolean' },
  ],
  relation: 'AND'
}
```

## Step 2: Combine Groups
```ts
const where = FilterBuilder.buildNestedFilters([
  identityGroup,
  statusGroup,
], 'AND')
```

## Step 3: Apply Additional Constraints
```ts
const tenantScoped = and(eq(users.tenantId, tenantId), where)
return db.select().from(users).where(tenantScoped)
```

## Conditional Group Inclusion
```ts
const groups = []
if (query.q) groups.push(identityGroup)
if (query.statusOnly) groups.push(statusGroup)
const where = FilterBuilder.buildNestedFilters(groups, 'AND')
```

## Deep Negation Example
```ts
// NOT ( (name ILIKE '%spam%') OR (email ILIKE '%spam%') )
const antiSpam = {
  filters: [
    { filter: { contains: 'spam' }, column: users.name, type: 'string' },
    { filter: { contains: 'spam' }, column: users.email, type: 'string' },
  ],
  relation: 'OR'
}

const where = not(FilterBuilder.buildFilterConditions(antiSpam.filters, antiSpam.relation)!)
```

## Tips
- Keep groups small (~2–5 filters) for readability.
- Encapsulate group builders in functions for reuse.
- Avoid triple nesting—refactor upstream into precomputed columns when logic becomes unwieldy.
