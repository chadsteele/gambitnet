const VERSION = chrome.runtime.getManifest().version;
let bridgeTabId;
const dashboardPorts = new Map();
const pendingRequests = new Map();
chrome.runtime.onInstalled.addListener(() => { bridgeTabId = undefined; });
chrome.action.onClicked.addListener(() => ensureBridge());
chrome.runtime.onConnect.addListener(registerDashboardPort);
chrome.runtime.onConnectExternal.addListener(registerDashboardPort);
function registerDashboardPort(port) {
  if (port.name !== 'dashboard-bridge') return;
  const dashboardId = port.sender?.tab?.id;
  if (dashboardId !== undefined) dashboardPorts.set(dashboardId, port);
  port.onDisconnect.addListener(() => { if (dashboardId !== undefined) dashboardPorts.delete(dashboardId); });
  port.onMessage.addListener(message => routeDashboardMessage(message, dashboardId));
});
chrome.runtime.onMessage.addListener((message, sender) => {
  if (message.type !== 'GAMBITNET_BRIDGE_RESULT' && message.type !== 'GAMBITNET_BRIDGE_ERROR') return;
  const port = pendingRequests.get(message.requestId);
  pendingRequests.delete(message.requestId);
  port?.postMessage(message);
});
async function routeDashboardMessage(message, dashboardId) {
  const port = dashboardPorts.get(dashboardId);
  if (message.type === 'GAMBITNET_VERSION_REQUEST') { port?.postMessage({ type: 'GAMBITNET_VERSION', version: VERSION, minDashboardVersion: '0.1.0' }); return; }
  if (message.type !== 'GAMBITNET_LLM_REQUEST') return;
  pendingRequests.set(message.requestId, port);
  await ensureBridge();
  chrome.tabs.sendMessage(bridgeTabId, { ...message, type: 'GAMBITNET_BRIDGE_REQUEST' });
}
async function ensureBridge() {
  if (bridgeTabId !== undefined) { try { await chrome.tabs.get(bridgeTabId); return; } catch { bridgeTabId = undefined; } }
  bridgeTabId = (await chrome.tabs.create({ url: chrome.runtime.getURL('bridge.html'), active: false })).id;
}
