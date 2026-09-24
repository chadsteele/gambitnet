import { describe, expect, it } from 'vitest';
import { ChessBoard } from './index';

describe('ChessBoard', () => {
  it('rejects illegal moves and applies legal moves', () => {
    const board = new ChessBoard();
    expect(board.canMove('e4')).toBe(true);
    expect(board.canMove('e5')).toBe(false);
    expect(board.apply('e4')).toBe('e4');
    expect(board.turn).toBe('b');
  });
});
