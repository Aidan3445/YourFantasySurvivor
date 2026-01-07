import { vi } from 'vitest';

/**
 * Mock Next.js caching utilities for testing
 *
 * Usage:
 * import { mockRevalidateTag } from '~/services/__mocks__/cache';
 *
 * vi.mock('next/cache', () => ({
 *   revalidateTag: mockRevalidateTag,
 * }));
 *
 * // In tests, verify tags were called
 * expect(mockRevalidateTag).toHaveBeenCalledWith('base-events', 'max');
 */

export const mockRevalidateTag = vi.fn();

export const mockUnstableCache = vi.fn((fn) => fn);

// Helper to reset cache mocks between tests
export const resetCacheMocks = () => {
  mockRevalidateTag.mockReset();
  mockUnstableCache.mockReset();
};
