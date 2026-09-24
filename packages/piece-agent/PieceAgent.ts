import type { BoardSnapshot, MotivationAssessment, PieceContext, PieceIdentity } from '@gambitnet/shared-types';

export interface LlmProvider {
  complete(prompt: string): Promise<string>;
}

export interface PieceAgentOptions {
  provider?: LlmProvider;
  context?: Partial<PieceContext>;
}

export class PieceAgent {
  readonly identity: PieceIdentity;
  private readonly provider?: LlmProvider;
  private context: PieceContext;

  constructor(identity: PieceIdentity, options: PieceAgentOptions = {}) {
    this.identity = identity;
    this.provider = options.provider;
    this.context = {
      identity,
      moveHistory: [],
      learnedNotes: [],
      personality: 'Curious, team-minded, and attentive to tactical opportunities.',
      ...options.context,
    };
  }

  get snapshot(): PieceContext { return structuredClone(this.context); }

  updateBoard(board: BoardSnapshot): void { this.context.board = board; }
  recordMove(move: string): void { this.context.moveHistory.push(move); }
  learn(note: string): void { this.context.learnedNotes.push(note); }

  buildPrompt(board: BoardSnapshot, teamSummary = 'The team is still evaluating the position.'): string {
    this.updateBoard(board);
    return [
      `You are ${this.identity.label}, an independent chess mind.`,
      `Personality: ${this.context.personality}`,
      `Your memory: ${this.context.learnedNotes.slice(-3).join(' | ') || 'No learned notes yet.'}`,
      `Your move history: ${this.context.moveHistory.slice(-8).join(', ') || 'None yet.'}`,
      `Team state: ${teamSummary}`,
      `Board FEN: ${board.fen}`,
      `Legal moves: ${board.legalMoves.join(', ')}`,
      'Return JSON only: {"motivation":0-100,"move":"SAN legal move","reasoning":"one sentence"}.',
      'Motivation should reflect salience, danger, king safety, history, and personality.',
    ].join('\n');
  }

  async assess(board: BoardSnapshot, teamSummary?: string): Promise<MotivationAssessment> {
    const prompt = this.buildPrompt(board, teamSummary);
    const raw = this.provider ? await this.provider.complete(prompt) : this.fallback(board);
    const assessment = this.parse(raw, board);
    this.recordMove(assessment.move);
    return assessment;
  }

  private fallback(board: BoardSnapshot): string {
    const move = board.legalMoves[0] ?? '';
    return JSON.stringify({ motivation: 50, move, reasoning: 'A legal move keeps the team active.' });
  }

  private parse(raw: string, board: BoardSnapshot): MotivationAssessment {
    try {
      const parsed = JSON.parse(raw) as Partial<MotivationAssessment>;
      const move = typeof parsed.move === 'string' && board.legalMoves.includes(parsed.move) ? parsed.move : board.legalMoves[0] ?? '';
      return {
        motivation: Math.max(0, Math.min(100, Number(parsed.motivation) || 0)),
        move,
        reasoning: typeof parsed.reasoning === 'string' ? parsed.reasoning : 'No reasoning supplied.',
      };
    } catch {
      return { motivation: 0, move: board.legalMoves[0] ?? '', reasoning: 'Provider returned unreadable JSON.' };
    }
  }
}
