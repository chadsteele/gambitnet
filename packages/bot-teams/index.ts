import type { PieceRole, TeamConfig } from '@gambitnet/shared-types';

const roles: PieceRole[] = ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r', 'p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'];
const presets = {
  'Immortal Pawns': 'Patient, stubborn, and always looking for a passed pawn.',
  Fortress: 'Defensive, patient, and obsessed with king safety.',
  Tricksters: 'Unpredictable, tactical, and delighted by complications.',
} as const;

export type BotPreset = keyof typeof presets;

export function createBotTeam(preset: BotPreset = 'Immortal Pawns'): TeamConfig {
  const id = `bot-${preset.toLowerCase().replaceAll(' ', '-')}-${crypto.randomUUID().slice(0, 8)}`;
  return {
    id,
    name: preset,
    ownerId: 'gambitnet-bot-factory',
    kind: 'bot',
    consecutiveWins: 0,
    pieces: Object.fromEntries(roles.map((role, index) => [
      `${index + 1}-${role}`,
      { personality: presets[preset], motivationBias: role === 'q' ? 8 : 0 },
    ])),
  };
}

export function ensureBotTeams(humanTeams: TeamConfig[], concurrentGames: number): TeamConfig[] {
  const needed = Math.max(0, concurrentGames - humanTeams.length);
  return [...humanTeams, ...Array.from({ length: needed }, (_, index) => createBotTeam((Object.keys(presets) as BotPreset[])[index % 3]))];
}
