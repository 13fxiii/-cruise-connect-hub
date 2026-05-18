#!/usr/bin/env bash
set -euo pipefail

echo "[ship] Cruise OS v4 ship cycle start"

bash .codex/guards/preinstall.sh
bash .codex/guards/prebuild.sh
bash .codex/intelligence/risk-score.sh
bash .codex/engine/deploy.sh
bash .codex/engine/pr-generator.sh
bash .codex/engine/monitor.sh

echo "[ship] complete"
