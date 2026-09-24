const provider = detectProvider();
window.addEventListener('message', event => { if (event.source !== window && event.data?.type === 'GAMBITNET_LLM_PROMPT') void handlePrompt(event.data); });
async function handlePrompt(message) {
  try { await sendPrompt(message.prompt); const text = await waitForResponse(); window.parent.postMessage({ type: 'GAMBITNET_LLM_RESULT', requestId: message.requestId, provider, text }, '*'); }
  catch (error) { window.parent.postMessage({ type: 'GAMBITNET_LLM_ERROR', requestId: message.requestId, provider, error: error.message }, '*'); }
}
function detectProvider() { const host = location.hostname; if (host.includes('chatgpt')) return 'chatgpt'; if (host.includes('gemini')) return 'gemini'; if (host.includes('claude')) return 'claude'; if (host.includes('qwen')) return 'qwen'; return 'deepseek'; }
async function sendPrompt(prompt) {
  const input = document.querySelector('textarea, [contenteditable="true"]');
  if (!input) throw new Error(`${provider}: chat input not found`);
  input.focus();
  if (input instanceof HTMLTextAreaElement) { const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')?.set; setter?.call(input, prompt); } else input.textContent = prompt;
  input.dispatchEvent(new Event('input', { bubbles: true }));
  document.querySelector('button[data-testid*="send"], button[aria-label*="Send"], button[aria-label*="send"]')?.click() ?? input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', bubbles: true }));
}
async function waitForResponse() { const started = Date.now(); let previous = ''; let stableTicks = 0; while (Date.now() - started < 90000) { const response = scrapeResponse(); if (response && response === previous) stableTicks += 1; else stableTicks = 0; if (response && stableTicks >= 3) return response; previous = response; await new Promise(resolve => setTimeout(resolve, 1000)); } throw new Error(`${provider}: response timed out`); }
function scrapeResponse() { const selectors = provider === 'chatgpt' ? '[data-message-author-role="assistant"]' : provider === 'gemini' ? '.model-response-text, message-content' : '[data-testid="conversation-turn-content"], main article'; return [...document.querySelectorAll(selectors)].at(-1)?.innerText?.trim() ?? ''; }
