import type { WorkerCommand, WorkerEvent } from '@gambitnet/shared-types';

const games = new Map<string, Worker>();
const ports = new Set<chrome.runtime.Port>();

chrome.runtime.onConnect.addListener(port => {
  if (port.name !== 'dashboard') return;
  ports.add(port);
  port.onDisconnect.addListener(() => ports.delete(port));
});

chrome.runtime.onMessage.addListener((message: WorkerCommand | { type: 'game:start'; gameId: string }, _sender, sendResponse) => {
  if (message.type === 'game:start') { sendResponse({ activeGames: games.size }); return; }
  if (message.type === 'start') startGame(message);
  if (message.type === 'stop') games.forEach(worker => worker.terminate());
  sendResponse({ ok: true });
  return true;
});

function startGame(command: Extract<WorkerCommand, { type: 'start' }>): void {
  const worker = new Worker(new URL('../workers/game-worker.ts', import.meta.url), { type: 'module' });
  games.set(command.gameId, worker);
  worker.onmessage = event => {
    const payload = event.data as WorkerEvent;
    ports.forEach(port => port.postMessage(payload));
    if (payload.type === 'finished' || payload.type === 'error') { worker.terminate(); games.delete(command.gameId); }
  };
  worker.onerror = () => { worker.terminate(); games.delete(command.gameId); };
  worker.postMessage(command);
}
