import { useState } from 'react';
import { createRoot } from 'react-dom/client';

function Settings() { const [concurrency, setConcurrency] = useState(3); return <main><h1>GambitNet settings</h1><label>Concurrent arenas <input type="number" min="1" max="8" value={concurrency} onChange={event => setConcurrency(Number(event.target.value))} /></label><p>LLM tabs are optional. Without one, the local fallback keeps the arena moving.</p><button onClick={() => chrome.storage.local.set({ concurrency })}>Save settings</button></main>; }
createRoot(document.getElementById('root')!).render(<Settings />);
