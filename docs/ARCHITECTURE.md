# Architecture

GambitNet is local-first. The Chrome extension owns orchestration, IndexedDB owns durable piece memories, and GunDB/WebRTC are optional peer transport layers.

A service worker starts one module worker per arena. Each worker owns a chess.js board and asks piece agents for motivation. The winning side is selected by match outcome, never by engine evaluation.

See the root README for diagrams and the [piece protocol](PIECE_PROTOCOL.md).
