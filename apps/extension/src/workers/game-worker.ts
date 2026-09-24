import { ChessBoard } from '@gambitnet/chess-core';
import { createIdentities, playTurn } from '@gambitnet/team-runtime';
import { PieceAgent } from '@gambitnet/piece-agent';
import type { MatchResult, TeamConfig, WorkerCommand, WorkerEvent } from '@gambitnet/shared-types';

self.onmessage = (event: MessageEvent<WorkerCommand>) => {
  if (event.data.type === 'start') void run(event.data.gameId, event.data.white, event.data.black);
};

async function run(gameId: string, white: TeamConfig, black: TeamConfig): Promise<void> {
  try {
    const board = new ChessBoard();
    const agents = [...createIdentities('w'), ...createIdentities('b')].map(identity => new PieceAgent(identity));
    let turns = 0;
    while (!board.isGameOver && turns < 200) {
      playTurn(board, agents);
      turns += 1;
      post({ type: 'progress', gameId, message: `Turn ${turns}: ${board.moves.at(-1) ?? 'thinking'}` });
      post({ type: 'state', state: { gameId, fen: board.fen, moves: board.moves, status: 'running' } });
      await new Promise(resolve => setTimeout(resolve, 40));
    }
    const result: MatchResult = { id: gameId, whiteTeamId: white.id, blackTeamId: black.id, winner: board.winner, moves: board.moves, completedAt: Date.now() };
    post({ type: 'finished', result });
  } catch (error) { post({ type: 'error', message: error instanceof Error ? error.message : 'Game failed.' }); }
}

function post(event: WorkerEvent): void { self.postMessage(event); }
