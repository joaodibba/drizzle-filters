# Operators

Operators differ slightly by data type. Below is a full matrix with approximate SQL translation (Postgres). Non-applicable operators are ignored by the schema.

| Operator | String | Number | Date | Boolean | SQL Example |
|----------|--------|--------|------|---------|-------------|
| `equals` | ✔ | ✔ | ✔ | ✔ | `col = value` |
| `not` | ✔ (value or nested) | ✔ | ✔ | ✔ | `col <> value` or `NOT ( ... )` |
| `lt` | ✖ | ✔ | ✔ | ✖ | `col < value` |
| `lte` | ✖ | ✔ | ✔ | ✖ | `col <= value` |
| `gt` | ✖ | ✔ | ✔ | ✖ | `col > value` |
| `gte` | ✖ | ✔ | ✔ | ✖ | `col >= value` |
| `in` | ✔ | ✔ | ✔ | ✖ | `col IN (...)` |
| `notIn` | ✔ | ✔ | ✔ | ✖ | `col NOT IN (...)` |
| `contains` | ✔ | ✖ | ✖ | ✖ | `col ILIKE '%value%'` |
| `startsWith` | ✔ | ✖ | ✖ | ✖ | `col ILIKE 'value%'` |
| `endsWith` | ✔ | ✖ | ✖ | ✖ | `col ILIKE '%value'` |
| `isNull` | ✔ | ✔ | ✔ | ✔ | `col IS NULL` |
| `isNotNull` | ✔ | ✔ | ✔ | ✔ | `col IS NOT NULL` |

## Notes
- Date strings are coerced using `z.coerce.date()`—invalid dates throw.
- `not` with nested object produces grouped negation: `NOT ( (col ILIKE '%x%') AND (col ILIKE '%y%') )` depending on inner structure.
- For plain strings inside `not`, it's a simple inequality.

## Examples
```ts
// String: name contains 'jo' but not ending with 'hn'
{ contains: 'jo', not: { endsWith: 'hn' } }

// Number: age in a set but not 0
{ in: [18, 21, 30], not: 0 }

// Date: created this year
{ gte: '2025-01-01', lt: '2026-01-01' }
```

## Invalid Operator Handling
Unknown operator keys cause validation failure (Zod `.strict()`), avoiding silent no‑ops:
```ts
// Throws: invalidProp is not allowed
{ invalidProp: 10 }
```

## Extending Operators
You can wrap parsing with your own Zod object merging additional properties (e.g. `between`). If you add new semantics, create a custom utility to translate them into Drizzle expressions before passing to `FilterBuilder`.
