import { describe, it, expect } from 'vitest'
import { textSearch, inFilter } from '../src'
import { pgTable, text, integer, boolean as pgBoolean, timestamp } from 'drizzle-orm/pg-core'

// Mock database schema for testing
const users = pgTable('users', {
  id: integer('id').primaryKey(),
  name: text('name'),
  email: text('email'),
  age: integer('age'),
  active: pgBoolean('active'),
  createdAt: timestamp('created_at')
})

describe('Utility Functions', () => {
  describe('textSearch', () => {
    it('searches across multiple columns with OR', () => {
      const where = textSearch('john', [users.name, users.email])
      expect(where).toBeDefined()
    })

    it('trims whitespace from search term', () => {
      const where = textSearch('  john  ', [users.name])
      expect(where).toBeDefined()
    })

    it('returns undefined for empty search term', () => {
      const where = textSearch('', [users.name])
      expect(where).toBeUndefined()
    })

    it('returns undefined for whitespace-only search term', () => {
      const where = textSearch('   ', [users.name])
      expect(where).toBeUndefined()
    })

    it('returns undefined for null search term', () => {
      const where = textSearch(null as any, [users.name])
      expect(where).toBeUndefined()
    })

    it('handles single column search', () => {
      const where = textSearch('test', [users.name])
      expect(where).toBeDefined()
    })

    it('handles multiple columns', () => {
      const where = textSearch('query', [users.name, users.email, users.id])
      expect(where).toBeDefined()
    })
  })

  describe('inFilter', () => {
    it('filters by array of values', () => {
      const where = inFilter(users.name, ['admin', 'user'])
      expect(where).toBeDefined()
    })

    it('handles number type', () => {
      const where = inFilter(users.age, [18, 25, 30], 'number')
      expect(where).toBeDefined()
    })

    it('handles date type', () => {
      const dates = [new Date('2024-01-01'), new Date('2024-12-31')]
      const where = inFilter(users.createdAt, dates, 'date')
      expect(where).toBeDefined()
    })

    it('handles boolean type', () => {
      const where = inFilter(users.active, [true, false], 'boolean')
      expect(where).toBeDefined()
    })

    it('returns undefined for empty array', () => {
      const where = inFilter(users.name, [])
      expect(where).toBeUndefined()
    })

    it('returns undefined for null values', () => {
      const where = inFilter(users.name, null as any)
      expect(where).toBeUndefined()
    })

    it('coerces string numbers to numbers', () => {
      const where = inFilter(users.age, ['18' as any, '25' as any], 'number')
      expect(where).toBeDefined()
    })

    it('handles single value in array', () => {
      const where = inFilter(users.name, ['admin'])
      expect(where).toBeDefined()
    })
  })
})
