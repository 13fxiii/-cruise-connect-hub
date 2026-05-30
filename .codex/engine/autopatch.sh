#!/usr/bin/env bash
set -euo pipefail

echo "[autopatch] dependency refresh"
npm ci

echo "[autopatch] lint autofix pass"
npm run lint -- --fix || true

echo "[autopatch] complete"
