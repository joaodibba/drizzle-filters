# Utilities

Two helper functions simplify common search patterns and reduce boilerplate when dealing with `IN` lists and multi-column text search.

## `textSearch(searchTerm, columns)`
Case-insensitive ILIKE search across multiple columns. Whitespace-only or empty strings yield `undefined`.
```ts
const where = textSearch('john', [users.name, users.email, users.bio])
```
Combine with other conditions:
```ts
const search = textSearch(query.q, [users.name, users.email])
const filters = FilterBuilder.buildWhere([ /* mappings */ ])
return db.select().from(users).where(and(search, filters))
```

## `inFilter(column, values, type?)`
Builds an `IN` condition with value coercion.
```ts
inFilter(users.age, [18, '21', 30], 'number') // coerces strings -> numbers
```
Returns `undefined` for missing or empty arrays.

## Type Coercion Matrix
| Type | Coercion |
|------|----------|
| number | `Number(val)` |
| date | `new Date(val)` if not already Date |
| boolean | `Boolean(val)` |
| string | identity |

## Patterns
### Guard for Optional Arrays
```ts
const tagCondition = inFilter(posts.tagId, input.tagIds ?? [])
```

### Composable Search + Filters
```ts
const search = textSearch(query.search, [users.name, users.email])
const where = FilterBuilder.buildWhere([...])
const final = search ? and(search, where) : where
```
