import { describe, it, expect } from 'vitest';
import { camelToTitle } from '~/lib/utils';

describe('camelToTitle', () => {
  it('should convert camelCase to Title Case', () => {
    expect(camelToTitle('camelCase')).toBe('Camel Case');
  });

  it('should handle single word', () => {
    expect(camelToTitle('word')).toBe('Word');
  });

  it('should handle multiple capital letters', () => {
    expect(camelToTitle('thisIsATest')).toBe('This Is A Test');
  });

  it('should handle already capitalized first letter', () => {
    expect(camelToTitle('Already Capitalized')).toBe('Already Capitalized');
  });

  it('should handle consecutive capitals (no space insertion)', () => {
    expect(camelToTitle('HTMLElement')).toBe('HTML Element');
  });

  it('should handle empty string', () => {
    expect(camelToTitle('')).toBe('');
  });

  it('should handle string with spaces (idempotent)', () => {
    expect(camelToTitle('Already Title Case')).toBe('Already Title Case');
  });
});
