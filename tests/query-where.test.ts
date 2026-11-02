import { describe, it, expect, beforeAll } from 'vitest'
import { PGlite } from '@electric-sql/pglite'
import { drizzle } from 'drizzle-orm/pglite'
import * as orm from 'drizzle-orm'
import { pgTable, text, integer } from 'drizzle-orm/pg-core'
import { createFilter } from '../src'

const users = pgTable('users', { id: integer('id').primaryKey(), name: text('name'), age: integer('age') })
const posts = pgTable('posts', { id: integer('id').primaryKey(), userId: integer('user_id'), title: text('title') })

const uf = createFilter(users)
const pf = createFilter(posts)
const ids = (rows: { id: number }[]) => rows.map(r => r.id)
const defineRelations = (orm as any).defineRelations

let db: any
beforeAll(async () => {
  const client = new PGlite()
  await client.exec(`
    create table users(id int primary key, name text, age int);
    create table posts(id int primary key, user_id int, title text);
    insert into users values (1, 'John', 30), (2, 'joana', 15), (3, '50% Bob', 40);
    insert into posts values (1, 1, 'Hello'), (2, 1, '100% sure'), (3, 3, 'hi');
  `)
  db = defineRelations
    ? drizzle({
        client,
        relations: defineRelations({ users, posts }, (r: any) => ({
          users: { posts: r.many.posts({ from: r.users.id, to: r.posts.userId }) },
        })),
      } as any)
    : drizzle(client as any, { schema: { users, posts } })
})

describe('core select', () => {
  it('toWhere', async () => {
    expect(ids(await db.select().from(users).where(uf.toWhere({ NOT: { age: { lt: 18 } } })))).toEqual([1, 3])
  })
})

describe.runIf(defineRelations)('db.query (Drizzle 1.0)', () => {
  const find = async (where: unknown) => ids(await db.query.users.findMany({ where, orderBy: { id: 'asc' } }))

  it('toQueryWhere with AND / OR', async () => {
    expect(await find(uf.toQueryWhere({ OR: [{ name: { startsWith: 'jo' } }, { age: { gt: 35 } }] }))).toEqual([1, 2, 3])
  })

  it('escapes wildcards', async () => {
    expect(await find(uf.toQueryWhere({ name: { contains: '%' } }))).toEqual([3])
  })

  it('combines with native relation filters', async () => {
    expect(await find({ ...uf.toQueryWhere({ age: { gte: 18 } }), posts: true })).toEqual([1, 3])
    expect(await find({ posts: pf.toQueryWhere({ title: { startsWith: 'h' } }) })).toEqual([1, 3])
  })

  it('works on aliased tables inside `with`', async () => {
    const [user] = await db.query.users.findMany({
      where: { id: 1 },
      with: { posts: { where: pf.toQueryWhere({ title: { contains: '%' } }) } },
    })
    expect(ids(user.posts)).toEqual([2])
  })

  it('empty input matches everything', async () => {
    expect(await find(uf.toQueryWhere({}))).toEqual([1, 2, 3])
  })
})

describe.runIf(!defineRelations)('db.query (Drizzle 0.x)', () => {
  it('toWhere with the query table', async () => {
    const rows = await db.query.users.findMany({
      where: (t: typeof users) => uf.toWhere({ OR: [{ name: { startsWith: 'jo' } }, { age: { gt: 35 } }] }, t),
      orderBy: (t: typeof users, { asc }: any) => asc(t.id),
    })
    expect(ids(rows)).toEqual([1, 2, 3])
  })
})
