export type Color = 'w' | 'b';
export type PieceRole = 'p' | 'n' | 'b' | 'r' | 'q' | 'k';

export interface PieceIdentity {
  id: string;
  color: Color;
  role: PieceRole;
  square: string;
  label: string;
}

export interface BoardSnapshot {
  fen: string;
  turn: Color;
  legalMoves: string[];
  moveNumber: number;
  lastMove?: string;
}

export interface MotivationAssessment {
  motivation: number;
  move: string;
  reasoning: string;
}

export interface PieceContext {
  identity: PieceIdentity;
  board?: BoardSnapshot;
  moveHistory: string[];
  learnedNotes: string[];
  personality: string;
}

export interface TeamConfig {
  id: string;
  name: string;
  ownerId: string;
  kind: 'human' | 'bot';
  pieces: Record<string, { personality: string; motivationBias: number }>;
  consecutiveWins: number;
}

export interface MatchResult {
  id: string;
  whiteTeamId: string;
  blackTeamId: string;
  winner?: 'w' | 'b' | 'draw';
  moves: string[];
  completedAt: number;
}

export type WorkerCommand =
  | { type: 'start'; gameId: string; white: TeamConfig; black: TeamConfig }
  | { type: 'stop' }
  | { type: 'resume'; state: SerializedGameState };

export interface SerializedGameState {
  gameId: string;
  fen: string;
  moves: string[];
  status: 'running' | 'finished' | 'stopped';
}

export type WorkerEvent =
  | { type: 'state'; state: SerializedGameState }
  | { type: 'progress'; gameId: string; message: string }
  | { type: 'finished'; result: MatchResult }
  | { type: 'error'; message: string };
