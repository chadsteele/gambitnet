const MIN_DASHBOARD_VERSION = '0.1.0';
let port;
window.addEventListener('message', event => {
  if (event.source !== window || event.data?.type !== 'GAMBITNET_PING') return;
  window.postMessage({ type: 'GAMBITNET_PONG', version: chrome.runtime.getManifest().version, minDashboardVersion: MIN_DASHBOARD_VERSION }, '*');
  connect();
});
function connect() {
  if (port) return;
  port = chrome.runtime.connect({ name: 'dashboard-bridge' });
  port.onMessage.addListener(message => window.postMessage(message, '*'));
  port.onDisconnect.addListener(() => { port = undefined; });
  window.addEventListener('message', event => {
    if (event.source === window || !event.data?.type?.startsWith('GAMBITNET_') || event.data.type === 'GAMBITNET_PING') return;
    port?.postMessage(event.data);
  });
}
