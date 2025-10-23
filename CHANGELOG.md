# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Fixed
- Improved error handling in `buildSingleFilter` to prevent "undefined is not an object" errors when validation fails
- Added optional chaining for `error.errors` access to ensure robust error messages across all JavaScript environments
- Enhanced error messages to include fallback for edge cases where ZodError structure is unexpected

### Added
- New test cases for type mismatch validation errors
- Test coverage for multiple filters with invalid types

## [0.1.1] - 2025-10-09

### Added
- Core FilterBuilder with type-safe helpers:
	- `buildWhere(filterMappings, validate?)`
	- `buildFilterConditions(configs, relation?, validate?)`
	- `buildNestedFilters(nestedConfigs, globalRelation?, validate?)`
	- `validateFilter(filter, type)`
- Zod-backed filter schemas and types:
	- `stringFilterSchema`, `numberFilterSchema`, `dateFilterSchema`, `booleanFilterSchema`
	- Recursive `not` support across all schemas
	- Type exports: `StringFilter`, `NumberFilter`, `DateFilter`, `BooleanFilter`, `FilterOperator`
- Utilities:
	- `textSearch(term, columns)` for OR ILIKE across multiple columns
	- `inFilter(column, values, type)` with coercion for number/date/boolean
- Types for composition:
	- `FilterType` ('string' | 'number' | 'date' | 'boolean')
	- `RelationType` ('AND' | 'OR')
	- Configs: `FilterConfig`, `NestedFilterConfig`, `FilterMapping`, `FilterValue`
- Supported operators
	- strings: `equals`, `not`, `in`, `notIn`, `contains`, `startsWith`, `endsWith`, `isNull`, `isNotNull`
	- numbers: `equals`, `not`, `lt`, `lte`, `gt`, `gte`, `in`, `notIn`, `isNull`, `isNotNull`
	- dates: `equals`, `not`, `lt`, `lte`, `gt`, `gte`, `in`, `notIn`, `isNull`, `isNotNull` (with `z.coerce.date()`)
	- booleans: `equals`, `not`, `isNull`, `isNotNull`

### Documentation
- README with quickstart, operator cheat sheet, and utility examples

### Tooling
- Build with `tsup`; ESM + CJS + types exports
- Strict TypeScript setup, eslint config, and Node >=18 engine field

### Tests
- Vitest suite covering builders, schemas, and utilities with coverage report
