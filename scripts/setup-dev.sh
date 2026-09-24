#!/usr/bin/env bash
set -euo pipefail

REPO_URL="${GAMBITNET_REPO_URL:-https://github.com/gambitnet/gambitnet.git}"
TARGET="${1:-gambitnet}"
if [[ -f "package.json" ]] && [[ -f "pnpm-workspace.yaml" ]]; then
  TARGET="."
elif [[ ! -f "${TARGET}/package.json" ]]; then
  git clone "${REPO_URL}" "${TARGET}"
fi
cd "${TARGET}"
pnpm install
pnpm build:packages
pnpm --filter @gambitnet/signaling-server dev &
SIGNALING_PID=$!
trap 'kill "${SIGNALING_PID}" 2>/dev/null || true' EXIT
pnpm build
printf '\nBuilt extension: %s/apps/extension/dist\n' "$PWD"
printf 'Load that dist directory at chrome://extensions with Developer mode enabled.\n'
wait "${SIGNALING_PID}"
