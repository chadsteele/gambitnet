import { Chess } from 'chess.js';
import type { BoardSnapshot, Color } from '@gambitnet/shared-types';

export class ChessBoard {
  private readonly game: Chess;

  constructor(fen?: string) {
    this.game = new Chess(fen);
  }

  get fen(): string { return this.game.fen(); }
  get turn(): Color { return this.game.turn(); }
  get moves(): string[] { return this.game.history(); }
  get isGameOver(): boolean { return this.game.isGameOver(); }
  get winner(): Color | 'draw' | undefined {
    if (!this.isGameOver) return undefined;
    if (this.game.isDraw() || this.game.isStalemate()) return 'draw';
    return this.game.turn() === 'w' ? 'b' : 'w';
  }

  snapshot(): BoardSnapshot {
    return {
      fen: this.fen,
      turn: this.turn,
      legalMoves: this.game.moves(),
      moveNumber: this.game.moveNumber(),
      lastMove: this.moves.at(-1),
    };
  }

  legalMoves(): string[] { return this.game.moves(); }

  apply(move: string): string {
    const result = this.game.move(move);
    return result.san;
  }

  canMove(move: string): boolean {
    try {
      const probe = new Chess(this.fen);
      probe.move(move);
      return true;
    } catch {
      return false;
    }
  }
}

export const STARTING_FEN = new Chess().fen();
