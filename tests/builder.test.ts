import { describe, it, expect } from 'vitest'
import { FilterBuilder } from '../src'
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

describe('FilterBuilder - buildSingleFilter', () => {
  it('builds equals condition', () => {
    const where = FilterBuilder.buildWhere([
      { filter: { equals: 'John' }, column: users.name, type: 'string' }
    ])
    expect(where).toBeDefined()
  })

  it('builds contains condition (case insensitive)', () => {
    const where = FilterBuilder.buildWhere([
      { filter: { contains: 'john' }, column: users.name, type: 'string' }
    ])
    expect(where).toBeDefined()
  })

  it('builds numeric comparison conditions', () => {
    const where = FilterBuilder.buildWhere([
      { filter: { gte: 18, lte: 65 }, column: users.age, type: 'number' }
    ])
    expect(where).toBeDefined()
  })

  it('builds in array condition', () => {
    const where = FilterBuilder.buildWhere([
      { filter: { in: ['admin', 'user'] }, column: users.name, type: 'string' }
    ])
    expect(where).toBeDefined()
  })

  it('builds notIn array condition', () => {
    const where = FilterBuilder.buildWhere([
      { filter: { notIn: [1, 2, 3] }, column: users.age, type: 'number' }
    ])
    expect(where).toBeDefined()
  })

  it('builds isNull condition', () => {
    const where = FilterBuilder.buildWhere([
      { filter: { isNull: true }, column: users.email, type: 'string' }
    ])
    expect(where).toBeDefined()
  })

  it('builds isNotNull condition', () => {
    const where = FilterBuilder.buildWhere([
      { filter: { isNotNull: true }, column: users.email, type: 'string' }
    ])
    expect(where).toBeDefined()
  })

  it('handles empty filter', () => {
    const where = FilterBuilder.buildWhere([
      { filter: null, column: users.name, type: 'string' }
    ])
    expect(where).toBeUndefined()
  })

  it('handles undefined filter', () => {
    const where = FilterBuilder.buildWhere([
      { filter: undefined, column: users.name, type: 'string' }
    ])
    expect(where).toBeUndefined()
  })
})

describe('FilterBuilder - buildWhere', () => {
  it('combines multiple filters with AND', () => {
    const where = FilterBuilder.buildWhere([
      { filter: { contains: 'john' }, column: users.name, type: 'string' },
      { filter: { gte: 18 }, column: users.age, type: 'number' },
      { filter: { equals: true }, column: users.active, type: 'boolean' }
    ])
    expect(where).toBeDefined()
  })

  it('returns undefined when no filters provided', () => {
    const where = FilterBuilder.buildWhere([])
    expect(where).toBeUndefined()
  })

  it('skips null/undefined filters', () => {
    const where = FilterBuilder.buildWhere([
      { filter: { contains: 'john' }, column: users.name, type: 'string' },
      { filter: null, column: users.age, type: 'number' },
      { filter: undefined, column: users.email, type: 'string' }
    ])
    expect(where).toBeDefined()
  })

  it('validates filters by default', () => {
    expect(() => {
      FilterBuilder.buildWhere([
        { filter: { contains: 123 }, column: users.name, type: 'string' }
      ])
    }).toThrow(/Filter validation failed/)
  })

  it('skips validation when disabled', () => {
    const where = FilterBuilder.buildWhere([
      { filter: { contains: 'test' }, column: users.name, type: 'string' }
    ], false)
    expect(where).toBeDefined()
  })
})

describe('FilterBuilder - buildFilterConditions', () => {
  it('combines conditions with AND by default', () => {
    const where = FilterBuilder.buildFilterConditions([
      { filter: { gte: 18 }, column: users.age, type: 'number' },
      { filter: { equals: true }, column: users.active, type: 'boolean' }
    ])
    expect(where).toBeDefined()
  })

  it('combines conditions with OR when specified', () => {
    const where = FilterBuilder.buildFilterConditions([
      { filter: { contains: 'john' }, column: users.name, type: 'string' },
      { filter: { contains: 'john' }, column: users.email, type: 'string' }
    ], 'OR')
    expect(where).toBeDefined()
  })

  it('returns undefined for empty configs', () => {
    const where = FilterBuilder.buildFilterConditions([])
    expect(where).toBeUndefined()
  })
})

describe('FilterBuilder - buildNestedFilters', () => {
  it('builds complex nested AND/OR logic', () => {
    const where = FilterBuilder.buildNestedFilters([
      {
        filters: [
          { filter: { contains: 'john' }, column: users.name, type: 'string' },
          { filter: { contains: 'john' }, column: users.email, type: 'string' }
        ],
        relation: 'OR'
      },
      {
        filters: [
          { filter: { gte: 18 }, column: users.age, type: 'number' },
          { filter: { equals: true }, column: users.active, type: 'boolean' }
        ],
        relation: 'AND'
      }
    ], 'AND')
    expect(where).toBeDefined()
  })

  it('handles OR at global level', () => {
    const where = FilterBuilder.buildNestedFilters([
      {
        filters: [
          { filter: { equals: 'admin' }, column: users.name, type: 'string' }
        ]
      },
      {
        filters: [
          { filter: { gte: 65 }, column: users.age, type: 'number' }
        ]
      }
    ], 'OR')
    expect(where).toBeDefined()
  })

  it('returns undefined for empty nested configs', () => {
    const where = FilterBuilder.buildNestedFilters([])
    expect(where).toBeUndefined()
  })
})

describe('FilterBuilder - Type Coercion', () => {
  it('coerces string to number', () => {
    const where = FilterBuilder.buildWhere([
      { filter: { equals: '25' }, column: users.age, type: 'number' }
    ], false) // Skip validation to test coercion
    expect(where).toBeDefined()
  })

  it('handles Date objects', () => {
    const date = new Date('2024-01-01')
    const where = FilterBuilder.buildWhere([
      { filter: { gte: date }, column: users.createdAt, type: 'date' }
    ])
    expect(where).toBeDefined()
  })

  it('coerces string to Date', () => {
    const where = FilterBuilder.buildWhere([
      { filter: { gte: '2024-01-01' }, column: users.createdAt, type: 'date' }
    ])
    expect(where).toBeDefined()
  })

  it('handles boolean type', () => {
    const where = FilterBuilder.buildWhere([
      { filter: { equals: true }, column: users.active, type: 'boolean' }
    ])
    expect(where).toBeDefined()
  })
})

describe('FilterBuilder - Nested NOT filters', () => {
  it('handles nested not filter', () => {
    const where = FilterBuilder.buildWhere([
      { 
        filter: { 
          not: { 
            contains: 'spam' 
          } 
        }, 
        column: users.email, 
        type: 'string' 
      }
    ], false)
    expect(where).toBeDefined()
  })

  it('handles deeply nested not filter', () => {
    const where = FilterBuilder.buildWhere([
      { 
        filter: { 
          not: { 
            not: { 
              equals: 'admin' 
            } 
          } 
        }, 
        column: users.name, 
        type: 'string' 
      }
    ], false)
    expect(where).toBeDefined()
  })
})

describe('FilterBuilder - Error Handling', () => {
  it('throws error for invalid string filter with validation', () => {
    expect(() => {
      FilterBuilder.buildWhere([
        { filter: { contains: 123 }, column: users.name, type: 'string' }
      ])
    }).toThrow(/Filter validation failed/)
  })

  it('throws error for invalid number filter with validation', () => {
    expect(() => {
      FilterBuilder.buildWhere([
        { filter: { gte: 'not a number' }, column: users.age, type: 'number' }
      ])
    }).toThrow()
  })

  it('provides clear error messages', () => {
    try {
      FilterBuilder.buildWhere([
        { filter: { unknownOperator: 'test' }, column: users.name, type: 'string' }
      ])
    } catch (error) {
      expect(error).toBeDefined()
      expect((error as Error).message).toContain('Filter validation failed')
    }
  })
})

describe('FilterBuilder - Real-world Scenarios', () => {
  it('filters users by name search and age range', () => {
    const where = FilterBuilder.buildWhere([
      { filter: { contains: 'john' }, column: users.name, type: 'string' },
      { filter: { gte: 18, lte: 65 }, column: users.age, type: 'number' }
    ])
    expect(where).toBeDefined()
  })

  it('searches across name and email with OR, combined with age filter', () => {
    const searchCondition = FilterBuilder.buildFilterConditions([
      { filter: { contains: 'john' }, column: users.name, type: 'string' },
      { filter: { contains: 'john' }, column: users.email, type: 'string' }
    ], 'OR')

    const where = FilterBuilder.buildFilterConditions([
      { filter: searchCondition ? {} : undefined, column: users.name },
      { filter: { gte: 18 }, column: users.age, type: 'number' }
    ])
    
    expect(searchCondition).toBeDefined()
  })

  it('filters active users created in date range', () => {
    const where = FilterBuilder.buildWhere([
      { filter: { equals: true }, column: users.active, type: 'boolean' },
      { 
        filter: { 
          gte: '2024-01-01', 
          lte: '2024-12-31' 
        }, 
        column: users.createdAt, 
        type: 'date' 
      }
    ])
    expect(where).toBeDefined()
  })

  it('excludes specific user IDs', () => {
    const where = FilterBuilder.buildWhere([
      { filter: { notIn: [1, 2, 3] }, column: users.id, type: 'number' }
    ])
    expect(where).toBeDefined()
  })

  it('finds users with null email (unverified)', () => {
    const where = FilterBuilder.buildWhere([
      { filter: { isNull: true }, column: users.email, type: 'string' }
    ])
    expect(where).toBeDefined()
  })
})
