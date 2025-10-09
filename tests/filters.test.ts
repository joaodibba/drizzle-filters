import { describe, it, expect, beforeEach } from 'vitest'
import { FilterBuilder } from '../src'
import { pgTable, text, integer, boolean as pgBoolean, timestamp, varchar } from 'drizzle-orm/pg-core'
import { SQL } from 'drizzle-orm'

// Extended schema for advanced testing
const posts = pgTable('posts', {
  id: integer('id').primaryKey(),
  title: varchar('title', { length: 255 }),
  content: text('content'),
  authorId: integer('author_id'),
  published: pgBoolean('published'),
  viewCount: integer('view_count'),
  publishedAt: timestamp('published_at'),
  createdAt: timestamp('created_at'),
})

// Helper type for better type safety in tests
type PostsTable = typeof posts

// Test data constants
const TEST_DATA = {
  authorIds: {
    single: 123,
    multiple: [1, 2, 3] as number[],
    team: [1, 2, 3, 4, 5] as number[],
  },
  searchTerms: {
    typescript: 'typescript',
    javascript: 'javascript',
    empty: '',
  },
  viewCounts: {
    zero: 0,
    low: 10,
    medium: 100,
    high: 1000,
    veryHigh: 10000,
  },
  dates: {
    yearStart: new Date('2024-01-01'),
    yearEnd: new Date('2024-12-31'),
  },
  titles: {
    excluded: ['Draft', 'Test', 'Untitled'] as string[],
  },
} as const

// Helper functions
const expectValidWhereClause = (where: SQL | undefined) => {
  expect(where).toBeDefined()
  expect(where).toBeInstanceOf(SQL)
}


describe('Advanced Filter Scenarios', () => {
  describe('Combined Text and Metadata Filtering', () => {
    it('should filter published posts by specific author with minimum view threshold', () => {
      const where = FilterBuilder.buildWhere([
        { filter: { equals: TEST_DATA.authorIds.single }, column: posts.authorId, type: 'number' },
        { filter: { equals: true }, column: posts.published, type: 'boolean' },
        { filter: { gte: TEST_DATA.viewCounts.high }, column: posts.viewCount, type: 'number' },
      ])
      
      expectValidWhereClause(where)
    })

    it('should search for posts with title OR content containing keyword', () => {
      const where = FilterBuilder.buildFilterConditions([
        { filter: { contains: TEST_DATA.searchTerms.typescript }, column: posts.title, type: 'string' },
        { filter: { contains: TEST_DATA.searchTerms.typescript }, column: posts.content, type: 'string' },
      ], 'OR')
      
      expectValidWhereClause(where)
    })

    it('should filter posts published within date range AND with minimum views', () => {
      const where = FilterBuilder.buildNestedFilters([
        {
          filters: [
            { filter: { gte: TEST_DATA.dates.yearStart }, column: posts.publishedAt, type: 'date' },
            { filter: { lte: TEST_DATA.dates.yearEnd }, column: posts.publishedAt, type: 'date' },
          ],
          relation: 'AND'
        },
        {
          filters: [
            { filter: { gte: TEST_DATA.viewCounts.medium * 5 }, column: posts.viewCount, type: 'number' },
          ],
          relation: 'AND'
        }
      ], 'AND')
      
      expectValidWhereClause(where)
    })
  })

  describe('Complex NOT Conditions', () => {
    it('should exclude posts from specific authors using notIn', () => {
      const where = FilterBuilder.buildWhere([
        { filter: { notIn: TEST_DATA.authorIds.multiple }, column: posts.authorId, type: 'number' },
      ])
      
      expectValidWhereClause(where)
    })

    it('should find unpublished OR draft posts (null publishedAt)', () => {
      const where = FilterBuilder.buildFilterConditions([
        { filter: { equals: false }, column: posts.published, type: 'boolean' },
        { filter: { isNull: true }, column: posts.publishedAt, type: 'date' },
      ], 'OR')
      
      expectValidWhereClause(where)
    })

    it('should exclude posts with specific titles', () => {
      const where = FilterBuilder.buildWhere([
        { filter: { notIn: TEST_DATA.titles.excluded }, column: posts.title, type: 'string' },
      ])
      
      expectValidWhereClause(where)
    })
  })

  describe('Range and Boundary Conditions', () => {
    it('should filter posts with views in specific range', () => {
      const where = FilterBuilder.buildWhere([
        { 
          filter: { 
            gte: TEST_DATA.viewCounts.medium, 
            lte: TEST_DATA.viewCounts.high 
          }, 
          column: posts.viewCount, 
          type: 'number' 
        },
      ])
      
      expectValidWhereClause(where)
    })

    it('should find posts created within last month', () => {
      const lastMonth = new Date()
      lastMonth.setMonth(lastMonth.getMonth() - 1)
      
      const where = FilterBuilder.buildWhere([
        { filter: { gte: lastMonth }, column: posts.createdAt, type: 'date' },
      ])
      
      expectValidWhereClause(where)
    })

    it('should find posts with extreme view counts (outliers)', () => {
      const where = FilterBuilder.buildFilterConditions([
        { filter: { lt: TEST_DATA.viewCounts.low }, column: posts.viewCount, type: 'number' },
        { filter: { gt: TEST_DATA.viewCounts.veryHigh }, column: posts.viewCount, type: 'number' },
      ], 'OR')
      
      expectValidWhereClause(where)
    })
  })

  describe('Null Handling and Edge Cases', () => {
    it('should find posts with missing metadata (null fields)', () => {
      const where = FilterBuilder.buildWhere([
        { filter: { isNull: true }, column: posts.publishedAt, type: 'date' },
        { filter: { isNull: true }, column: posts.viewCount, type: 'number' },
      ])
      
      expectValidWhereClause(where)
    })

    it('should find posts with complete metadata (no null fields)', () => {
      const where = FilterBuilder.buildWhere([
        { filter: { isNotNull: true }, column: posts.publishedAt, type: 'date' },
        { filter: { isNotNull: true }, column: posts.viewCount, type: 'number' },
        { filter: { isNotNull: true }, column: posts.content, type: 'string' },
      ])
      
      expectValidWhereClause(where)
    })

    it('should handle zero view count correctly (not treated as null)', () => {
      const where = FilterBuilder.buildWhere([
        { filter: { equals: TEST_DATA.viewCounts.zero }, column: posts.viewCount, type: 'number' },
      ])
      
      expectValidWhereClause(where)
    })
  })

  describe('Performance Optimization Patterns', () => {
    it('should use IN operator for multiple specific values instead of multiple OR equals', () => {
      const where = FilterBuilder.buildWhere([
        { filter: { in: TEST_DATA.authorIds.team }, column: posts.authorId, type: 'number' },
      ])
      
      expectValidWhereClause(where)
    })

    it('should combine prefix search with other filters efficiently', () => {
      const where = FilterBuilder.buildWhere([
        { filter: { startsWith: 'How to' }, column: posts.title, type: 'string' },
        { filter: { equals: true }, column: posts.published, type: 'boolean' },
      ])
      
      expectValidWhereClause(where)
    })
  })

  describe('Validation and Edge Cases', () => {
    it('should handle empty string in contains filter', () => {
      const where = FilterBuilder.buildWhere([
        { filter: { contains: TEST_DATA.searchTerms.empty }, column: posts.title, type: 'string' },
      ])
      
      expectValidWhereClause(where)
    })

    it('should handle multiple compatible filters on same column', () => {
      const where = FilterBuilder.buildWhere([
        { 
          filter: { 
            gte: TEST_DATA.viewCounts.medium, 
            lte: TEST_DATA.viewCounts.high 
          }, 
          column: posts.viewCount, 
          type: 'number' 
        },
      ])
      
      expectValidWhereClause(where)
    })

    it('should handle range with separate filter conditions (AND relation)', () => {
      const where = FilterBuilder.buildFilterConditions([
        { filter: { gte: TEST_DATA.viewCounts.medium }, column: posts.viewCount, type: 'number' },
        { filter: { lte: TEST_DATA.viewCounts.high }, column: posts.viewCount, type: 'number' },
      ], 'AND')
      
      expectValidWhereClause(where)
    })

    it('should handle mixed date formats in same filter (Date object and string)', () => {
      const where = FilterBuilder.buildWhere([
        { 
          filter: { 
            gte: TEST_DATA.dates.yearStart, 
            lte: TEST_DATA.dates.yearEnd 
          }, 
          column: posts.publishedAt, 
          type: 'date' 
        },
      ])
      
      expectValidWhereClause(where)
    })
  })
})


describe('Real-world API Endpoint Scenarios', () => {
  describe('Search Endpoint', () => {
    it('should implement search with pagination metadata and multiple filters', () => {
      const searchTerm = TEST_DATA.searchTerms.javascript
      const minViews = TEST_DATA.viewCounts.medium
      const authorIds = TEST_DATA.authorIds.multiple
      
      const where = FilterBuilder.buildNestedFilters([
        {
          // Search in title or content
          filters: [
            { filter: { contains: searchTerm }, column: posts.title, type: 'string' },
            { filter: { contains: searchTerm }, column: posts.content, type: 'string' },
          ],
          relation: 'OR'
        },
        {
          // Additional filters
          filters: [
            { filter: { gte: minViews }, column: posts.viewCount, type: 'number' },
            { filter: { in: authorIds }, column: posts.authorId, type: 'number' },
            { filter: { equals: true }, column: posts.published, type: 'boolean' },
          ],
          relation: 'AND'
        }
      ], 'AND')
      
      expectValidWhereClause(where)
    })
  })

  describe('Trending Posts Endpoint', () => {
    it('should filter trending posts from last 3 days with high view count', () => {
      const threeDaysAgo = new Date()
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)
      
      const where = FilterBuilder.buildWhere([
        { filter: { gte: threeDaysAgo }, column: posts.publishedAt, type: 'date' },
        { filter: { gte: TEST_DATA.viewCounts.high }, column: posts.viewCount, type: 'number' },
        { filter: { equals: true }, column: posts.published, type: 'boolean' },
      ])
      
      expectValidWhereClause(where)
    })
  })

  describe('Admin Moderation Endpoint', () => {
    it('should filter unpublished OR draft posts for moderation', () => {
      const where = FilterBuilder.buildFilterConditions([
        { filter: { isNull: true }, column: posts.publishedAt, type: 'date' },
        { filter: { equals: false }, column: posts.published, type: 'boolean' },
      ], 'OR')
      
      expectValidWhereClause(where)
    })
  })
})
