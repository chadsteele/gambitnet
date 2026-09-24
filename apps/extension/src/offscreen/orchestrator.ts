chrome.runtime.onMessage.addListener((message) => {
  if (message.type === 'orchestrator:ping') chrome.runtime.sendMessage({ type: 'orchestrator:pong' });
});
