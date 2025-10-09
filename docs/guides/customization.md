# Customization

While `drizzle-filters` covers common operators, you can extend behavior.

## Add a `between` Operator for Numbers
```ts
const numberWithBetween = numberFilterSchema.unwrap().extend({
  between: z.tuple([z.number(), z.number()]).optional()
}).strict().optional()

const extendedUserFilter = z.object({
  age: numberWithBetween,
})

function normalize(filter: any) {
  if (filter?.between) {
    const [min, max] = filter.between
    return { ...filter, gte: min, lte: max, between: undefined }
  }
  return filter
}

const raw = extendedUserFilter.parse(req.query.filters)
const normalized = { ...raw, age: normalize(raw.age) }
const where = FilterBuilder.buildWhere([
  { filter: normalized.age, column: users.age, type: 'number' }
])
```

## Wrap Builder for Reusable Multi-Field Text Search
```ts
function buildUserSearch(input: { q?: string; minAge?: number }) {
  const mappings = [] as FilterMapping[]
  if (input.minAge) mappings.push({ filter: { gte: input.minAge }, column: users.age, type: 'number' })
  const search = input.q ? textSearch(input.q, [users.name, users.email]) : undefined
  const filterWhere = FilterBuilder.buildWhere(mappings)
  return search ? and(search, filterWhere) : filterWhere
}
```

## Enforcing Tenant Isolation
```ts
function tenantWhere(filters: FilterMapping[], tenantId: string) {
  const base = FilterBuilder.buildWhere(filters)
  return and(eq(users.tenantId, tenantId), base)
}
```

## Adding Caching Layer
Cache compiled filter objects for identical JSON inputs (micro-optimization):
```ts
const cache = new Map<string, any>()
function cachedBuild(mappings: FilterMapping[]) {
  const key = JSON.stringify(mappings)
  if (cache.has(key)) return cache.get(key)
  const where = FilterBuilder.buildWhere(mappings)
  cache.set(key, where)
  return where
}
```

## Logging Translation
```ts
const where = FilterBuilder.buildWhere(mappings)
console.debug('Filters', JSON.stringify(mappings))
```

## Caution
- Avoid executing arbitrary user-provided column names—columns are explicit to prevent injection.
- Do not mix raw SQL fragments inside filter objects; extend via utilities instead.
