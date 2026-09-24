const board = document.querySelector('#board');
const turnLabel = document.querySelector('#turn-label');
const motivation = document.querySelector('#motivation-value');
const agentName = document.querySelector('#agent-name');
const agentReason = document.querySelector('#agent-reason');
const moments = [
  ['78', 'Knight at g1', '“The center is asking a question.”'],
  ['64', 'Bishop at c1', '“Open lines reward patience.”'],
  ['91', 'Queen at d1', '“The king needs a little room.”'],
];
let moment = 0;

setInterval(() => {
  moment = (moment + 1) % moments.length;
  const [score, name, reason] = moments[moment];
  motivation.textContent = score;
  agentName.textContent = name;
  agentReason.textContent = reason;
  turnLabel.textContent = `TURN ${18 + moment} · ${moment === 2 ? 'BLACK' : 'WHITE'} TO MOVE`;
  board?.classList.remove('pulse');
  requestAnimationFrame(() => board?.classList.add('pulse'));
}, 2800);