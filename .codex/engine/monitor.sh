#!/usr/bin/env bash
set -euo pipefail

echo "[monitor] verifying build artifacts"
if [ ! -d ".next" ]; then
  echo "[monitor] ERROR: missing .next directory"
  exit 1
fi

echo "[monitor] healthy"
