import type { MatchResult, PieceContext, TeamConfig } from '@gambitnet/shared-types';

type LearnablePiece = Pick<PieceContext, 'identity'> & { learn(note: string): void };

export interface EvolutionState {
  wins: number;
  losses: number;
  consecutiveWins: number;
  eligibleForPeerTournament: boolean;
}

export function updateEvolution(team: TeamConfig, result: MatchResult, pieces: LearnablePiece[]): EvolutionState {
  const won = result.winner !== 'draw' && ((result.winner === 'w' && result.whiteTeamId === team.id) || (result.winner === 'b' && result.blackTeamId === team.id));
  const state: EvolutionState = {
    wins: won ? 1 : 0,
    losses: won ? 0 : 1,
    consecutiveWins: won ? team.consecutiveWins + 1 : 0,
    eligibleForPeerTournament: won && team.consecutiveWins + 1 >= 3,
  };
  for (const piece of pieces) {
    piece.learn(won ? `Survived match ${result.id}; keep exploring what made ${piece.identity.label} useful.` : `Lost match ${result.id}; reconsider timing before committing again.`);
  }
  return state;
}

export function resetExtinctTeam(team: TeamConfig): TeamConfig {
  return { ...team, consecutiveWins: 0, pieces: Object.fromEntries(Object.entries(team.pieces).map(([id, piece]) => [id, { ...piece, motivationBias: 0 }])) };
}
