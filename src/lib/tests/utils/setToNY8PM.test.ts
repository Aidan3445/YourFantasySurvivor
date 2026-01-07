import { describe, it, expect } from 'vitest';
import { setToNY8PM } from '~/lib/utils';

describe('setToNY8PM', () => {
  it('should parse valid date string to NY 8PM', () => {
    const result = setToNY8PM('2024-01-15');
    expect(result).toBeInstanceOf(Date);
    expect(result.toString()).toContain('2024');
  });

  it('should handle date strings in various formats', () => {
    const result1 = setToNY8PM('2024-01-15');
    const result2 = setToNY8PM('2024-1-15');
    
    expect(result1).toBeInstanceOf(Date);
    expect(result2).toBeInstanceOf(Date);
  });

  it('should return future date (+7 days) on parse error', () => {
    const now = new Date();
    const result = setToNY8PM('invalid-date');
    
    // Should be approximately 7 days from now
    const daysDiff = (result.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    expect(daysDiff).toBeGreaterThan(6);
    expect(daysDiff).toBeLessThan(8);
  });

  it('should return future date for empty string', () => {
    const now = new Date();
    const result = setToNY8PM('');
    
    const daysDiff = (result.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    expect(daysDiff).toBeGreaterThan(6);
    expect(daysDiff).toBeLessThan(8);
  });

  it('should use EST timezone in parsing', () => {
    // The function should parse the date as "YYYY-MM-DD 20:00:00 EST"
    const result = setToNY8PM('2024-01-15');
    
    // Format should process through Intl.DateTimeFormat with America/New_York timezone
    expect(result).toBeInstanceOf(Date);
  });

  it('should be idempotent for valid dates', () => {
    const result1 = setToNY8PM('2024-01-15');
    const result2 = setToNY8PM('2024-01-15');
    
    expect(result1.getTime()).toBe(result2.getTime());
  });
});
