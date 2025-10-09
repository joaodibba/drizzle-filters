# FAQ

## Why not just write SQL / Drizzle conditions manually?
You can—but this library standardizes user-facing filtering, adds runtime validation, and reduces repetitive coercion.

## Does this protect against SQL injection?
Yes. Operator keys are whitelisted and values are parameterized by Drizzle.

## Is validation expensive?
Negligible for typical API payload sizes (microseconds). Optimize only after measurement.

## Can I add custom operators?
Yes—extend the Zod schema and normalize into existing standard operators before passing to the builders.

## How do I OR two different columns?
Use `buildFilterConditions` with top-level relation `OR`, or use `buildNestedFilters` for more complex grouping.

## What about fuzzy search / trigram / full-text?
Use database-specific features separately; combine their resulting SQL expressions with the builder's output using Drizzle `and/or` helpers.

## Can I filter relations / joins?
This library focuses on per-table column operators. You can still join tables first, then apply filters referencing joined columns, or wrap in higher-level utilities.

## Does it support pagination / ordering?
Out of scope—combine with your own limit/offset or cursor logic.

## How do errors surface?
An `Error` whose message starts with `Filter validation failed:` containing aggregated paths. Intercept and map to HTTP 400.

## Can I disable specific operators for security?
Define your own schemas exposing only allowed keys instead of using the exported ones directly.
