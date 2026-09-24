<script lang="ts">
  import { onMount } from 'svelte';
  import { connectBridge, type BridgeStatus } from './extension-bridge';

  type Team = { name: string; color: string; style: string; games: number; momentum: number };
  const providers = ['chatgpt', 'claude', 'gemini', 'qwen', 'deepseek'];
  let bridgeStatus: BridgeStatus = 'checking';
  let selectedProvider = 'chatgpt';
  let team: Team = { name: 'North Star', color: 'white', style: 'Patient pressure', games: 0, momentum: 0 };
  let events = ['Team Lab ready. Configure a team, then start a local arena.'];
  let running = false;
  let cleanup: (() => void) | undefined;

  onMount(() => { cleanup = connectBridge((message) => { if (message.type === 'GAMBITNET_PONG') bridgeStatus = 'ready'; if (message.type === 'GAMBITNET_BRIDGE_STATUS') bridgeStatus = 'missing'; }); return () => cleanup?.(); });
  function startArena() { running = true; team = { ...team, games: team.games + 1, momentum: Math.min(100, team.momentum + 18) }; events = [`Arena ${team.games + 1} started with ${team.style.toLowerCase()} enabled.`, ...events].slice(0, 5); }
  function resetTeam() { team = { ...team, games: 0, momentum: 0 }; running = false; events = ['Team reset. The next match starts from the opening position.', ...events].slice(0, 5); }
</script>

<svelte:head><meta name="description" content="GambitNet Team Lab: configure teams of independent chess minds and watch them learn." /></svelte:head>
<div class="app-shell">
  <header class="topbar"><a class="brand" href="/gambitnet/">GAMBIT<span>NET</span></a><nav><a class="active" href="#lab">Team Lab</a><a href="https://github.com/chadsteele/gambitnet">Source ↗</a></nav><span class="status-dot" class:online={bridgeStatus === 'ready'}>{bridgeStatus === 'ready' ? 'Bridge online' : bridgeStatus === 'checking' ? 'Checking bridge' : 'Bridge needed'}</span></header>
  {#if bridgeStatus === 'missing'}<div class="notice"><strong>Connect the Chrome bridge</strong><span>Install the minimal GambitNet extension to let teams consult browser LLM sessions.</span><a href="https://github.com/chadsteele/gambitnet#install-the-bridge">Installation guide ↗</a></div>{/if}
  <main id="lab"><section class="intro"><p class="eyebrow">LOCAL ARENA / 01</p><h1>Give every piece<br /><em>a point of view.</em></h1><p>Shape a team, run a match, and watch momentum collect in the browser. Your settings stay on this device.</p></section>
    <section class="lab-grid"><aside class="panel builder"><div class="panel-heading"><span>TEAM BUILDER</span><span class="index">01</span></div><label>Team name<input bind:value={team.name} /></label><label>Side<select bind:value={team.color}><option value="white">White</option><option value="black">Black</option></select></label><label>Team temperament<select bind:value={team.style}><option>Patient pressure</option><option>Wild tactics</option><option>Quiet development</option><option>Endgame craft</option></select></label><div class="provider-label">LLM relay</div><div class="provider-row">{#each providers as provider}<button class:chosen={selectedProvider === provider} on:click={() => selectedProvider = provider}>{provider}</button>{/each}</div><div class="button-row"><button class="primary" on:click={startArena}>{running ? 'Run next game' : 'Start arena'} <span>→</span></button><button class="quiet" on:click={resetTeam}>Reset</button></div></aside>
      <section class="panel monitor"><div class="panel-heading"><span>ARENA MONITOR</span><span class="live" class:active={running}>● {running ? 'LIVE' : 'IDLE'}</span></div><div class="monitor-top"><div class="board" aria-label="Chess board preview">{#each Array(64) as _, i}<span class:dark={(Math.floor(i / 8) + i) % 2 === 1}>{i === 0 ? '♜' : i === 7 ? '♚' : i === 56 ? '♖' : i === 63 ? '♔' : ''}</span>{/each}</div><div class="metrics"><div><strong>{team.momentum}</strong><small>momentum</small></div><div><strong>{team.games}</strong><small>games logged</small></div><div><strong>{team.color === 'white' ? 'W' : 'B'}</strong><small>playing side</small></div></div></div><div class="event-log"><p>ACTIVITY LOG</p>{#each events as event}<div><span>›</span>{event}</div>{/each}</div></section></section>
  </main><footer><span>GAMBITNET / OPEN CHESS LABORATORY</span><span>Local-first. Browser-native. MIT.</span></footer>
</div>
