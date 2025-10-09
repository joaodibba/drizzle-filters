import { describe, it, expect } from 'vitest'
import { 
  stringFilterSchema, 
  numberFilterSchema, 
  dateFilterSchema, 
  booleanFilterSchema,
} from '../src'

describe('FilterBuilder - Zod Schema Validation', () => {
  describe('stringFilterSchema', () => {
    it('validates string filter with contains', () => {
      const result = stringFilterSchema.parse({ contains: 'test' })
      expect(result?.contains).toBe('test')
    })

    it('validates string filter with multiple operators', () => {
      const result = stringFilterSchema.parse({
        contains: 'test',
        startsWith: 'hello',
        endsWith: 'world'
      })
      expect(result?.contains).toBe('test')
      expect(result?.startsWith).toBe('hello')
      expect(result?.endsWith).toBe('world')
    })

    it('validates startsWith operator', () => {
      const result = stringFilterSchema.parse({ startsWith: 'prefix' })
      expect(result?.startsWith).toBe('prefix')
    })

    it('validates endsWith operator', () => {
      const result = stringFilterSchema.parse({ endsWith: 'suffix' })
      expect(result?.endsWith).toBe('suffix')
    })

    it('validates in operator with array', () => {
      const result = stringFilterSchema.parse({ in: ['a', 'b', 'c'] })
      expect(result?.in).toEqual(['a', 'b', 'c'])
    })

    it('validates notIn operator', () => {
      const result = stringFilterSchema.parse({ notIn: ['spam', 'test'] })
      expect(result?.notIn).toEqual(['spam', 'test'])
    })

    it('validates isNull operator', () => {
      const result = stringFilterSchema.parse({ isNull: true })
      expect(result?.isNull).toBe(true)
    })

    it('validates isNotNull operator', () => {
      const result = stringFilterSchema.parse({ isNotNull: true })
      expect(result?.isNotNull).toBe(true)
    })

    it('rejects invalid string filter', () => {
      expect(() => {
        stringFilterSchema.parse({ contains: 123 })
      }).toThrow()
    })

    it('rejects unknown properties', () => {
      expect(() => {
        stringFilterSchema.parse({ invalidProp: 'test' })
      }).toThrow()
    })

    it('accepts undefined/null values', () => {
      const result = stringFilterSchema.parse(undefined)
      expect(result).toBeUndefined()
    })
  })

  describe('numberFilterSchema', () => {
    it('validates number filter with comparison operators', () => {
      const result = numberFilterSchema.parse({
        gte: 18,
        lte: 65
      })
      expect(result?.gte).toBe(18)
      expect(result?.lte).toBe(65)
    })

    it('validates number filter with in operator', () => {
      const result = numberFilterSchema.parse({ in: [1, 2, 3] })
      expect(result?.in).toEqual([1, 2, 3])
    })

    it('validates lt operator', () => {
      const result = numberFilterSchema.parse({ lt: 100 })
      expect(result?.lt).toBe(100)
    })

    it('validates gt operator', () => {
      const result = numberFilterSchema.parse({ gt: 0 })
      expect(result?.gt).toBe(0)
    })

    it('validates equals operator', () => {
      const result = numberFilterSchema.parse({ equals: 42 })
      expect(result?.equals).toBe(42)
    })

    it('validates not operator', () => {
      const result = numberFilterSchema.parse({ not: 0 })
      expect(result?.not).toBe(0)
    })

    it('validates notIn operator', () => {
      const result = numberFilterSchema.parse({ notIn: [1, 2, 3] })
      expect(result?.notIn).toEqual([1, 2, 3])
    })

    it('rejects invalid number filter', () => {
      expect(() => {
        numberFilterSchema.parse({ gte: 'not a number' })
      }).toThrow()
    })

    it('accepts zero as valid number', () => {
      const result = numberFilterSchema.parse({ equals: 0 })
      expect(result?.equals).toBe(0)
    })

    it('accepts negative numbers', () => {
      const result = numberFilterSchema.parse({ gte: -10, lte: -5 })
      expect(result?.gte).toBe(-10)
      expect(result?.lte).toBe(-5)
    })
  })

  describe('dateFilterSchema', () => {
    it('validates date filter with Date objects', () => {
      const date = new Date('2024-01-01')
      const result = dateFilterSchema.parse({ gte: date })
      expect(result?.gte).toBeInstanceOf(Date)
      expect(result?.gte?.getFullYear()).toBe(2024)
    })

    it('coerces string to Date', () => {
      const result = dateFilterSchema.parse({ gte: '2024-01-01' })
      expect(result?.gte).toBeInstanceOf(Date)
      expect(result?.gte?.getFullYear()).toBe(2024)
    })

    it('validates date range', () => {
      const result = dateFilterSchema.parse({
        gte: '2024-01-01',
        lte: '2024-12-31'
      })
      expect(result?.gte).toBeInstanceOf(Date)
      expect(result?.lte).toBeInstanceOf(Date)
    })

    it('validates lt operator', () => {
      const result = dateFilterSchema.parse({ lt: '2024-06-01' })
      expect(result?.lt).toBeInstanceOf(Date)
    })

    it('validates equals with date', () => {
      const result = dateFilterSchema.parse({ equals: '2024-01-01' })
      expect(result?.equals).toBeInstanceOf(Date)
    })

    it('validates in array with dates', () => {
      const result = dateFilterSchema.parse({ 
        in: ['2024-01-01', '2024-02-01'] 
      })
      expect(result?.in).toHaveLength(2)
      expect(result?.in?.[0]).toBeInstanceOf(Date)
    })

    it('coerces timestamps to dates', () => {
      const timestamp = 1704067200000 // 2024-01-01
      const result = dateFilterSchema.parse({ gte: timestamp })
      expect(result?.gte).toBeInstanceOf(Date)
    })
  })

  describe('booleanFilterSchema', () => {
    it('validates boolean filter with equals', () => {
      const result = booleanFilterSchema.parse({ equals: true })
      expect(result?.equals).toBe(true)
    })

    it('validates boolean not filter', () => {
      const result = booleanFilterSchema.parse({ not: false })
      expect(result?.not).toBe(false)
    })

    it('validates isNull for boolean', () => {
      const result = booleanFilterSchema.parse({ isNull: true })
      expect(result?.isNull).toBe(true)
    })

    it('validates isNotNull for boolean', () => {
      const result = booleanFilterSchema.parse({ isNotNull: true })
      expect(result?.isNotNull).toBe(true)
    })

    it('rejects non-boolean values', () => {
      expect(() => {
        booleanFilterSchema.parse({ equals: 'not a boolean' })
      }).toThrow()
    })
  })
})
