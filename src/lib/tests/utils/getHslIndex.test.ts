import { describe, it, expect } from 'vitest';
import { getHslIndex } from '~/lib/utils';

describe('getHslIndex', () => {
  it('should return HSL color string', () => {
    const result = getHslIndex(0, 10);
    expect(result).toMatch(/^hsl\(\d+(\.\d+)?, \d+%, \d+%\)$/);
  });

  it('should calculate hue based on index and total', () => {
    const result1 = getHslIndex(0, 10);
    const result2 = getHslIndex(5, 10);
    const result3 = getHslIndex(10, 10);

    // Extract hue values (first number in HSL)
    const hue1 = parseFloat((/hsl\((\d+\.?\d*)/.exec(result1))?.[1] ?? '0');
    const hue2 = parseFloat((/hsl\((\d+\.?\d*)/.exec(result2))?.[1] ?? '0');
    const hue3 = parseFloat((/hsl\((\d+\.?\d*)/.exec(result3))?.[1] ?? '0');

    expect(hue1).toBe(0);
    expect(hue2).toBe(150);
    expect(hue3).toBe(300);
  });

  it('should alternate saturation between 50% and 80%', () => {
    const evenIndex = getHslIndex(0, 10);  // index & 1 = 0
    const oddIndex = getHslIndex(1, 10);   // index & 1 = 1

    expect(evenIndex).toContain('80%');
    expect(oddIndex).toContain('50%');
  });

  it('should always use 50% lightness', () => {
    const result = getHslIndex(5, 10);
    expect(result).toMatch(/, 50%\)$/);
  });

  it('should handle edge case with total = 1', () => {
    const result = getHslIndex(0, 1);
    expect(result).toBe('hsl(0, 80%, 50%)');
  });

  it('should handle large index values', () => {
    const result = getHslIndex(99, 100);
    expect(result).toMatch(/^hsl\(\d+\.?\d*, \d+%, \d+%\)$/);
    // hue should be close to 300 (297 exactly)
    const hue = parseFloat((/hsl\((\d+\.?\d*)/.exec(result))?.[1] ?? '0');
    expect(hue).toBeCloseTo(297, 0);
  });
});
