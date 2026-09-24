import type { MatchOutcome, MatchResult, PieceContext, QualificationConfig, TeamConfig } from '@gambitnet/shared-types';

type LearnablePiece = Pick<PieceContext, 'identity'> & { learn(note: string): void };

export interface EvolutionState {
  wins: number;
  losses: number;
  consecutiveWins: number;
  eligibleForPeerTournament: boolean;
  recentResults: MatchOutcome[];
  qualification: QualificationConfig;
}

export const DEFAULT_QUALIFICATION: QualificationConfig = { winsRequired: 3, gamesWindow: 3 };

export function normalizeQualification(config?: Partial<QualificationConfig>): QualificationConfig {
  const winsRequired = clampInteger(config?.winsRequired ?? DEFAULT_QUALIFICATION.winsRequired, 3, 10);
  const gamesWindow = clampInteger(config?.gamesWindow ?? DEFAULT_QUALIFICATION.gamesWindow, winsRequired, 10);
  return { winsRequired, gamesWindow };
}

export function isQualified(results: MatchOutcome[], config?: Partial<QualificationConfig>): boolean {
  const qualification = normalizeQualification(config);
  const window = results.slice(-qualification.gamesWindow);
  return window.length === qualification.gamesWindow && window.filter(outcome => outcome === 'win').length >= qualification.winsRequired;
}

export function updateEvolution(team: TeamConfig, result: MatchResult, pieces: LearnablePiece[], config?: Partial<QualificationConfig>): EvolutionState {
  const won = result.winner !== 'draw' && ((result.winner === 'w' && result.whiteTeamId === team.id) || (result.winner === 'b' && result.blackTeamId === team.id));
  const outcome: MatchOutcome = result.winner === 'draw' || !result.winner ? 'draw' : won ? 'win' : 'loss';
  const qualification = normalizeQualification(config ?? team.qualification);
  const recentResults = [...(team.recentResults ?? []), outcome].slice(-qualification.gamesWindow);
  const consecutiveWins = outcome === 'win' ? team.consecutiveWins + 1 : 0;
  const state: EvolutionState = {
    wins: recentResults.filter(entry => entry === 'win').length,
    losses: recentResults.filter(entry => entry === 'loss').length,
    consecutiveWins,
    eligibleForPeerTournament: isQualified(recentResults, qualification),
    recentResults,
    qualification,
  };
  for (const piece of pieces) {
    piece.learn(won ? `Survived match ${result.id}; keep exploring what made ${piece.identity.label} useful.` : `Lost match ${result.id}; reconsider timing before committing again.`);
  }
  return state;
}

export function resetExtinctTeam(team: TeamConfig): TeamConfig {
  return { ...team, consecutiveWins: 0, recentResults: [], pieces: Object.fromEntries(Object.entries(team.pieces).map(([id, piece]) => [id, { ...piece, motivationBias: 0 }])) };
}

function clampInteger(value: number, minimum: number, maximum: number): number {
  return Math.max(minimum, Math.min(maximum, Math.round(value)));
}
