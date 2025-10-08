# drizzle-filters

Type-safe filters for Drizzle ORM with Zod validation.

> Build consistent, validated API filtering without reinventing logic for each endpoint.

## Install
```bash
npm install drizzle-filters drizzle-orm zod
```

## Picking a Builder
| Scenario | Method |
|----------|--------|
| Simple endpoint | `FilterBuilder.buildWhere` |
| Need OR between columns | `FilterBuilder.buildFilterConditions` |
| Complex group logic | `FilterBuilder.buildNestedFilters` |

## Utilities
```ts
textSearch('john', [users.name, users.email])
inFilter(users.age, [18, 21, 30], 'number')
```

## License
MIT © 2025-present
