import { describe, expect, it } from 'vitest';
import { isQualified, normalizeQualification } from './index';

describe('qualification windows', () => {
  it('supports 4 wins in the last 5 games', () => {
    expect(isQualified(['win', 'win', 'loss', 'win', 'win'], { winsRequired: 4, gamesWindow: 5 })).toBe(true);
    expect(isQualified(['win', 'loss', 'loss', 'win', 'win'], { winsRequired: 4, gamesWindow: 5 })).toBe(false);
  });

  it('keeps configuration inside the 3 to 10 range', () => {
    expect(normalizeQualification({ winsRequired: 2, gamesWindow: 20 })).toEqual({ winsRequired: 3, gamesWindow: 10 });
    expect(normalizeQualification({ winsRequired: 8, gamesWindow: 4 })).toEqual({ winsRequired: 8, gamesWindow: 8 });
  });
});