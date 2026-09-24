import { ChessBoard } from '@gambitnet/chess-core';
import { PieceAgent } from '@gambitnet/piece-agent';
import type { MatchResult, PieceIdentity, TeamConfig } from '@gambitnet/shared-types';

export function weightedLottery(entries: Array<{ motivation: number; move: string }>): { motivation: number; move: string } {
  const total = entries.reduce((sum, entry) => sum + Math.max(1, entry.motivation), 0);
  let cursor = Math.random() * total;
  for (const entry of entries) {
    cursor -= Math.max(1, entry.motivation);
    if (cursor <= 0) return entry;
  }
  return entries.at(-1) ?? { motivation: 1, move: '' };
}

export function playTurn(board: ChessBoard, _agents: PieceAgent[]): string {
  const legal = board.legalMoves();
  const candidates = legal.map((move, index) => ({ motivation: 50 + index, move }));
  const selected = weightedLottery(candidates);
  return board.apply(selected.move);
}

export function createIdentities(color: 'w' | 'b'): PieceIdentity[] {
  const home = color === 'w' ? ['a1', 'b1', 'c1', 'd1', 'e1', 'f1', 'g1', 'h1'] : ['a8', 'b8', 'c8', 'd8', 'e8', 'f8', 'g8', 'h8'];
  const roles = ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'] as const;
  return [...home.map((square, index) => ({ id: `${color}-${roles[index]}-${square}`, color, role: roles[index], square, label: `${color === 'w' ? 'White' : 'Black'} ${roles[index]} at ${square}` })), ...Array.from({ length: 8 }, (_, index) => ({ id: `${color}-p-${index}`, color, role: 'p' as const, square: `${String.fromCharCode(97 + index)}${color === 'w' ? 2 : 7}`, label: `${color === 'w' ? 'White' : 'Black'} Pawn ${index + 1}` }))];
}

export function createMatchResult(gameId: string, board: ChessBoard, white: TeamConfig, black: TeamConfig): MatchResult {
  return { id: gameId, whiteTeamId: white.id, blackTeamId: black.id, winner: board.winner, moves: board.moves, completedAt: Date.now() };
}
