import { describe, it, expect } from 'vitest'
import { SQL } from 'drizzle-orm'
import { PgDialect, pgTable, text, integer, boolean, timestamp, jsonb } from 'drizzle-orm/pg-core'
import * as sqlite from 'drizzle-orm/sqlite-core'
import { createFilter, FilterBuilder, textSearch } from '../src'

const users = pgTable('users', {
  id: integer('id').primaryKey(),
  name: text('name'),
  age: integer('age'),
  active: boolean('active'),
  createdAt: timestamp('created_at'),
  meta: jsonb('meta'),
})

const pg = new PgDialect()
const flat = (sql: string) => sql.replace(/[()]/g, '')
const q = (s: SQL | undefined) => { const r = pg.sqlToQuery(s!); return { ...r, sql: flat(r.sql) } }

describe('createFilter', () => {
  const f = createFilter(users, { allow: ['name', 'age', 'active', 'createdAt'] })

  it('builds per-field conditions with inferred types', () => {
    const { sql, params } = q(f.toWhere({ age: { gte: 18 }, active: { equals: true } }))
    expect(sql).toBe('"users"."age" >= $1 and "users"."active" = $2')
    expect(params).toEqual([18, true])
  })

  it('supports client-side AND / OR / NOT', () => {
    const { sql, params } = q(f.toWhere({
      OR: [{ name: { startsWith: 'jo' } }, { age: { lt: 10 } }],
      NOT: { active: { equals: false } },
    }))
    expect(sql).toBe(`"users"."name" ilike $1 escape '!' or "users"."age" < $2 and not "users"."active" = $3`)
    expect(params).toEqual(['jo%', 10, false])
  })

  it('coerces dates from JSON strings', () => {
    const { params } = q(f.toWhere({ createdAt: { gt: '2025-01-01T00:00:00Z' } }))
    expect(params[0]).toBe('2025-01-01T00:00:00.000Z')
  })

  it('rejects fields outside the allowlist and wrong value types', () => {
    expect(() => f.toWhere({ id: { equals: 1 } })).toThrow()
    expect(() => f.toWhere({ age: { equals: 'x' } })).toThrow()
  })

  it('returns undefined for empty input', () => {
    expect(f.toWhere({})).toBeUndefined()
    expect(f.toWhere({ OR: [] })).toBeUndefined()
  })

  it('defaults to every supported column and skips the rest', () => {
    const all = createFilter(users)
    expect(() => all.toWhere({ id: { equals: 1 } })).not.toThrow()
    expect(() => all.toWhere({ meta: {} })).toThrow()
  })

  it('throws on allowlisted unsupported columns', () => {
    expect(() => createFilter(users, { allow: ['meta' as any] })).toThrow(/unsupported type/)
  })
})

describe('bug fixes', () => {
  it('keeps sibling operators next to an object `not`', () => {
    const { sql, params } = q(FilterBuilder.buildWhere([
      { column: users.age, type: 'number', filter: { gt: 5, not: { equals: 10 } } },
    ]))
    expect(sql).toBe('not "users"."age" = $1 and "users"."age" > $2')
    expect(params).toEqual([10, 5])
  })

  it('escapes LIKE wildcards', () => {
    const { params } = q(FilterBuilder.buildWhere([
      { column: users.name, filter: { contains: '50%_off!' } },
    ]))
    expect(params).toEqual(['%50!%!_off!!%'])
    expect(q(textSearch('%', [users.name])).params).toEqual(['%!%%'])
  })

  it('uses lower() like on non-Postgres dialects', () => {
    const posts = sqlite.sqliteTable('posts', { title: sqlite.text('title') })
    const { sql, params } = new ((sqlite as any).SQLiteSyncDialect ?? (sqlite as any).SQLiteDialect)().sqlToQuery(
      createFilter(posts).toWhere({ title: { contains: 'AbC' } })!,
    )
    expect(flat(sql)).toBe(`lower"posts"."title" like ? escape '!'`)
    expect(params).toEqual(['%abc%'])
  })
})
