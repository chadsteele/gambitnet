import { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import type { WorkerEvent } from '@gambitnet/shared-types';
import './dashboard.css';

function Dashboard() {
  const [events, setEvents] = useState<string[]>([]);
  const [active, setActive] = useState(0);
  useEffect(() => { const port = chrome.runtime.connect({ name: 'dashboard' }); port.onMessage.addListener((event: WorkerEvent) => { setEvents(previous => [event.type === 'progress' ? event.message : event.type, ...previous].slice(0, 8)); if (event.type === 'finished') setActive(value => Math.max(0, value - 1)); }); return () => port.disconnect(); }, []);
  const start = () => { setActive(value => value + 1); chrome.runtime.sendMessage({ type: 'game:start', gameId: crypto.randomUUID() }); };
  return <main><header><span className="eyebrow">DISTRIBUTED CHESS LAB</span><h1>GambitNet</h1><p>Every piece has a plan.</p></header><section className="status"><strong>{active}</strong><span>active arenas</span><button onClick={start}>Start arena</button></section><section className="log"><h2>Live signal</h2>{events.length ? events.map((event, index) => <div key={`${event}-${index}`}>{event}</div>) : <p>Waiting for your first match.</p>}</section></main>;
}

createRoot(document.getElementById('root')!).render(<Dashboard />);
