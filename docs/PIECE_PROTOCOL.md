# Piece Protocol

Providers receive a prompt containing piece identity, current FEN, legal moves, recent personal history, learned notes, and a team summary. They return JSON:

```json
{"motivation": 0, "move": "SAN legal move", "reasoning": "one sentence"}
```

The runtime clamps motivation to 0-100 and checks the move against chess.js. Provider output can influence urgency and choice, but cannot bypass legality.
