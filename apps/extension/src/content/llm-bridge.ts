const supported = location.hostname.includes('gemini') || location.hostname.includes('claude') || location.hostname.includes('chatgpt') || location.hostname.includes('qwen') || location.hostname.includes('deepseek');

if (supported) {
  chrome.runtime.onMessage.addListener((message: { type: string; prompt?: string }, _sender, sendResponse) => {
    if (message.type !== 'llm:complete' || !message.prompt) return;
    const input = document.querySelector('textarea, [contenteditable="true"]') as HTMLTextAreaElement | HTMLElement | null;
    if (!input) { sendResponse({ error: 'No chat input found.' }); return; }
    input.focus();
    if (input instanceof HTMLTextAreaElement) input.value = message.prompt; else input.textContent = message.prompt;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    sendResponse({ queued: true });
    return true;
  });
}
