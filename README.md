# drizzle-filters

Type-safe filters for Drizzle ORM with Zod validation.

> Build consistent, validated API filtering without reinventing logic for each endpoint.

## Install
```bash
npm install drizzle-filters drizzle-orm zod
```

## Quick start
```ts
import { createFilter } from 'drizzle-filters'

const usersFilter = createFilter(users, { allow: ['name', 'age', 'createdAt'] })

// GET /users?where={"OR":[{"name":{"contains":"jo"}},{"age":{"gte":18}}]}
const where = usersFilter.toWhere(JSON.parse(req.query.where))
await db.select().from(users).where(where)
```

Column types are read from the table, unknown fields are rejected, and clients can nest `AND`, `OR` and `NOT`. `usersFilter.schema` is the Zod schema, for tRPC inputs or OpenAPI. Tested with Drizzle 0.45 and 1.0-rc, Zod 3 and 4. Case-insensitive matching uses `ILIKE` on Postgres and `lower() LIKE` elsewhere.

### Relational queries
```ts
// Drizzle 1.0
await db.query.users.findMany({
  where: { ...usersFilter.toQueryWhere(input), posts: true },
  with: { posts: { where: postsFilter.toQueryWhere(postsInput) } },
})

// Drizzle 0.x
await db.query.users.findMany({ where: (t) => usersFilter.toWhere(input, t) })
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
