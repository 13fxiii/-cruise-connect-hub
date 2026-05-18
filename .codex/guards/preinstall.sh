#!/usr/bin/env bash
set -euo pipefail

echo "[preinstall] validating toolchain"
command -v node >/dev/null 2>&1 || { echo "[preinstall] ERROR: node missing"; exit 1; }
command -v npm >/dev/null 2>&1 || { echo "[preinstall] ERROR: npm missing"; exit 1; }

if [ ! -f package.json ]; then
  echo "[preinstall] ERROR: package.json missing"
  exit 1
fi
if [ ! -f package-lock.json ]; then
  echo "[preinstall] ERROR: package-lock.json missing"
  exit 1
fi

echo "[preinstall] ok"
