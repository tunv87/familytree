import { describe, expect, it } from 'vitest';
import { translate } from '.';
import { en } from './en';
import { vi } from './vi';

describe('translate', () => {
  it('returns Vietnamese by default', () => {
    expect(translate('vi', 'tree')).toBe('Cây gia phả');
  });

  it('falls back to Vietnamese when an English key is missing', () => {
    const missing = (Object.keys(vi) as (keyof typeof vi)[]).find((k) => !(k in en));
    if (missing) expect(translate('en', missing)).toBe(vi[missing]);
    expect(translate('en', 'tree')).toBe('Family tree');
  });
});
