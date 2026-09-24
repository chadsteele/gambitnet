# Contributing to GambitNet

GambitNet is a friendly research project. Start with an issue or discussion before large changes, especially changes to the piece protocol or P2P wire format.

## Development

```bash
pnpm install
pnpm build:packages
pnpm test
pnpm lint
pnpm build
```

Keep changes focused, add tests for rules and evolution behavior, and document protocol changes in `docs/`. Never add API tokens or private chess data to commits.

## Pull requests

Describe the player-facing behavior, the package boundary touched, and how you tested it. Small, reviewable pull requests move the arena forward fastest.
