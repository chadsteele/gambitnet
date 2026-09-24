const frames = new Map(['chatgpt', 'claude', 'gemini', 'qwen', 'deepseek'].map(provider => [provider, document.getElementById(provider)]));
const pending = new Set();
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type !== 'GAMBITNET_BRIDGE_REQUEST') return;
  const frame = frames.get(message.provider);
  if (!frame?.contentWindow) { sendResponse({ type: 'GAMBITNET_BRIDGE_ERROR', requestId: message.requestId, error: 'Provider frame is not ready.' }); return; }
  pending.add(message.requestId);
  frame.contentWindow.postMessage({ type: 'GAMBITNET_LLM_PROMPT', requestId: message.requestId, prompt: message.prompt }, '*');
  sendResponse({ type: 'GAMBITNET_BRIDGE_ACCEPTED', requestId: message.requestId });
});
window.addEventListener('message', event => {
  if (event.source === window || !event.data?.type?.startsWith('GAMBITNET_LLM_')) return;
  const message = event.data;
  if (!pending.delete(message.requestId)) return;
  chrome.runtime.sendMessage({ ...message, type: message.type === 'GAMBITNET_LLM_RESULT' ? 'GAMBITNET_BRIDGE_RESULT' : 'GAMBITNET_BRIDGE_ERROR' });
});
