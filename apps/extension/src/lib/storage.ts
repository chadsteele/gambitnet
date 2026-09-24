import { openDB } from 'idb';
import type { PieceContext, TeamConfig } from '@gambitnet/shared-types';

const dbPromise = openDB('gambitnet', 1, { upgrade(db) { db.createObjectStore('pieces', { keyPath: 'identity.id' }); db.createObjectStore('matches', { keyPath: 'id' }); } });

export async function savePieceContext(context: PieceContext): Promise<void> { (await dbPromise).put('pieces', context); }
export async function loadPieceContexts(): Promise<PieceContext[]> { return (await dbPromise).getAll('pieces'); }
export async function saveTeams(teams: TeamConfig[]): Promise<void> { await chrome.storage.local.set({ teams }); }
export async function loadTeams(): Promise<TeamConfig[]> { return ((await chrome.storage.local.get('teams')).teams as TeamConfig[] | undefined) ?? []; }
