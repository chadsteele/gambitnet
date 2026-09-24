const roles = [
  ['Rook', 'a1'], ['Knight', 'b1'], ['Bishop', 'c1'], ['Queen', 'd1'], ['King', 'e1'], ['Bishop', 'f1'], ['Knight', 'g1'], ['Rook', 'h1'],
  ['Pawn', 'a2'], ['Pawn', 'b2'], ['Pawn', 'c2'], ['Pawn', 'd2'], ['Pawn', 'e2'], ['Pawn', 'f2'], ['Pawn', 'g2'], ['Pawn', 'h2'],
];
const pieceGlyphs = { King: '♔', Queen: '♕', Rook: '♖', Bishop: '♗', Knight: '♘', Pawn: '♙' };
const presets = {
  'Immortal Pawns': 'Patient, stubborn, and always looking for a passed pawn.',
  Fortress: 'Defensive, patient, and obsessed with king safety.',
  Tricksters: 'Unpredictable, tactical, and delighted by complications.',
};
const storageKey = 'gambitnet-team-lab';
const defaultTeam = () => ({ id: crypto.randomUUID(), name: 'New Team', preset: 'custom', wins: 0, losses: 0, streak: 0, history: [], pieces: roles.map(([role, square], index) => piece(index, role, square, 'Curious, team-minded, and attentive to tactical opportunities.')) });
const piece = (index, role, square, personality) => ({ id: `${role.toLowerCase()}-${square}-${index}`, role, square, personality, bias: role === 'Queen' ? 8 : 0 });
let teams = loadTeams();
let activeId = teams[0]?.id ?? null;
let matchTimer;

const $ = selector => document.querySelector(selector);

function loadTeams() {
  try { return JSON.parse(localStorage.getItem(storageKey)) || [defaultTeam()]; } catch { return [defaultTeam()]; }
}
function persist() { localStorage.setItem(storageKey, JSON.stringify(teams)); }
function activeTeam() { return teams.find(team => team.id === activeId); }
function saveActive() { const team = activeTeam(); if (!team) return; team.name = $('#team-name').value.trim() || 'Unnamed Team'; team.preset = $('#team-preset').value; persist(); renderAll(); flash('Saved locally'); }
function flash(message) { $('#saved-state').textContent = message; setTimeout(() => { $('#saved-state').textContent = 'Saved locally'; }, 1800); }

function renderAll() {
  renderTeamList();
  renderTeamForm();
  renderPieces();
  renderMonitor();
}
function renderTeamList() {
  $('#team-list').innerHTML = teams.map(team => `<button class="team-item ${team.id === activeId ? 'active' : ''}" data-team-id="${team.id}"><span class="team-avatar">${team.name.slice(0, 1).toUpperCase()}</span><span><b>${escapeHtml(team.name)}</b><small>${team.wins} wins · ${team.history.length} matches</small></span><span class="team-chevron">›</span></button>`).join('');
  document.querySelectorAll('[data-team-id]').forEach(button => button.addEventListener('click', () => { activeId = button.dataset.teamId; renderAll(); }));
}
function renderTeamForm() { const team = activeTeam(); if (!team) return; $('#team-name').value = team.name; $('#team-preset').value = team.preset; }
function renderPieces() {
  const team = activeTeam(); if (!team) return;
  $('#piece-grid').innerHTML = team.pieces.map((pieceData, index) => `<article class="piece-card"><div class="piece-card-head"><span class="piece-glyph">${pieceGlyphs[pieceData.role]}</span><div><b>${pieceData.role}</b><small>${pieceData.square} · ${index + 1}/16</small></div><output id="bias-output-${pieceData.id}">${formatBias(pieceData.bias)}</output></div><label class="sr-only" for="personality-${pieceData.id}">${pieceData.role} personality</label><input class="personality-input" id="personality-${pieceData.id}" data-piece-id="${pieceData.id}" value="${escapeAttribute(pieceData.personality)}" /><label class="bias-label" for="bias-${pieceData.id}">Motivation bias <input id="bias-${pieceData.id}" data-piece-id="${pieceData.id}" class="bias-slider" type="range" min="-20" max="20" value="${pieceData.bias}" /><span>−20 <i></i> +20</span></label></article>`).join('');
  document.querySelectorAll('.personality-input').forEach(input => input.addEventListener('change', event => updatePiece(event.target.dataset.pieceId, { personality: event.target.value })));
  document.querySelectorAll('.bias-slider').forEach(input => input.addEventListener('input', event => { updatePiece(event.target.dataset.pieceId, { bias: Number(event.target.value) }); $(`#bias-output-${event.target.dataset.pieceId}`).textContent = formatBias(Number(event.target.value)); }));
}
function updatePiece(id, changes) { const pieceData = activeTeam().pieces.find(item => item.id === id); Object.assign(pieceData, changes); persist(); }
function renderMonitor() {
  const team = activeTeam(); if (!team) return;
  $('#record').textContent = `${team.wins}–${team.losses}`; $('#streak').textContent = team.streak; $('#qualification').textContent = `${Math.min(team.wins, 3)} / 3`; $('#progress-bar').style.width = `${Math.min(team.wins / 3 * 100, 100)}%`;
  $('#match-history-list').innerHTML = team.history.length ? team.history.slice().reverse().map(match => `<div class="history-row"><span><b>${match.opponent}</b><small>${match.date}</small></span><strong class="${match.result === 'WIN' ? 'result-win' : 'result-loss'}">${match.result}</strong></div>`).join('') : '<p class="empty-state">No matches yet. Start one when your team is ready.</p>';
}
function startMatch() {
  if (matchTimer) return;
  const team = activeTeam(); if (!team) return;
  const button = $('#start-match'); button.disabled = true; $('#match-status').textContent = 'Thinking'; $('#match-detail').textContent = 'Pieces are making their case...'; let ticks = 0;
  matchTimer = setInterval(() => { ticks += 1; $('#match-detail').textContent = `Turn ${ticks * 4}: ${['Knight', 'Bishop', 'Pawn', 'Queen'][ticks % 4]} is motivated.`; if (ticks >= 5) { clearInterval(matchTimer); matchTimer = undefined; const won = Math.random() > 0.38; team.history.push({ opponent: ['Fortress', 'Tricksters', 'Bot Foundry'][Math.floor(Math.random() * 3)], result: won ? 'WIN' : 'LOSS', date: new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) }); if (won) { team.wins += 1; team.streak += 1; } else { team.losses += 1; team.streak = 0; } persist(); $('#match-status').textContent = won ? 'Victory' : 'Extinct'; $('#match-detail').textContent = won ? 'Your team remembers this match.' : 'The team resets and studies the loss.'; button.disabled = false; renderAll(); } }, 500);
}
function applyPreset(event) { const preset = event.target.value; const team = activeTeam(); if (!team || !presets[preset]) return; team.preset = preset; team.pieces.forEach(pieceData => { pieceData.personality = presets[preset]; }); renderPieces(); persist(); }
function newTeam() { const team = defaultTeam(); teams.push(team); activeId = team.id; persist(); renderAll(); $('#team-name').focus(); }
function shareTeam() { const team = activeTeam(); const code = btoa(JSON.stringify({ name: team.name, preset: team.preset, pieces: team.pieces })); navigator.clipboard?.writeText(`GAMBIT-${code}`).then(() => { $('#share-status').textContent = 'Copied'; setTimeout(() => { $('#share-status').textContent = ''; }, 1800); }); }
function formatBias(value) { return value > 0 ? `+${value}` : `${value}`; }
function escapeHtml(value) { return value.replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[character])); }
function escapeAttribute(value) { return escapeHtml(value); }

$('#new-team').addEventListener('click', newTeam);
$('#save-team').addEventListener('click', saveActive);
$('#share-team').addEventListener('click', shareTeam);
$('#start-match').addEventListener('click', startMatch);
$('#team-preset').addEventListener('change', applyPreset);
$('#team-name').addEventListener('change', saveActive);
renderAll();
