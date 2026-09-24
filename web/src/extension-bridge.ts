export type BridgeStatus = 'checking' | 'ready' | 'missing' | 'outdated';
export type BridgeMessage = { type: string; version?: string; minDashboardVersion?: string; [key: string]: unknown };

export function connectBridge(onMessage: (message: BridgeMessage) => void) {
  let status: BridgeStatus = 'checking';
  const listener = (event: MessageEvent<BridgeMessage>) => {
    if (event.source !== window || !event.data?.type) return;
    if (event.data.type === 'GAMBITNET_PONG') status = event.data.minDashboardVersion === '0.1.0' ? 'ready' : 'outdated';
    onMessage(event.data);
  };
  window.addEventListener('message', listener);
  window.postMessage({ type: 'GAMBITNET_PING' }, '*');
  const timer = window.setTimeout(() => { if (status === 'checking') onMessage({ type: 'GAMBITNET_BRIDGE_STATUS', status: 'missing' }); }, 1200);
  return () => { window.clearTimeout(timer); window.removeEventListener('message', listener); };
}

export function requestLLM(provider: string, prompt: string) {
  const requestId = crypto.randomUUID();
  window.postMessage({ type: 'GAMBITNET_LLM_REQUEST', requestId, provider, prompt }, '*');
  return requestId;
}
