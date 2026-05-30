#!/usr/bin/env bash
set -euo pipefail

echo "[pr] branch: $(git branch --show-current)"
echo "[pr] working tree summary"
git status --short
