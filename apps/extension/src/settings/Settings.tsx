import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { DEFAULT_QUALIFICATION, normalizeQualification } from '@gambitnet/evolution';
import type { QualificationConfig } from '@gambitnet/shared-types';

function Settings() {
	const [concurrency, setConcurrency] = useState(3);
	const [qualification, setQualification] = useState<QualificationConfig>(DEFAULT_QUALIFICATION);
	const updateQualification = (field: keyof QualificationConfig, value: number) => setQualification(current => normalizeQualification({ ...current, [field]: value }));
	const save = () => chrome.storage.local.set({ concurrency, qualification });
	return <main><h1>GambitNet settings</h1><label>Concurrent arenas <input type="number" min="1" max="8" value={concurrency} onChange={event => setConcurrency(Number(event.target.value))} /></label><fieldset><legend>Peer tournament qualification</legend><label>Wins required <input type="number" min="3" max="10" value={qualification.winsRequired} onChange={event => updateQualification('winsRequired', Number(event.target.value))} /></label><label>Games in window <input type="number" min={qualification.winsRequired} max="10" value={qualification.gamesWindow} onChange={event => updateQualification('gamesWindow', Number(event.target.value))} /></label><p>A team qualifies when it reaches the wins target within its most recent games. Examples: 3 of 3, 4 of 5, or 5 of 6.</p></fieldset><p>LLM tabs are optional. Without one, the local fallback keeps the arena moving.</p><button onClick={save}>Save settings</button></main>;
}
createRoot(document.getElementById('root')!).render(<Settings />);
