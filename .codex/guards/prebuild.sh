#!/usr/bin/env bash
set -euo pipefail

echo "[prebuild] validating dependencies"
if [ ! -d node_modules ]; then
  echo "[prebuild] ERROR: node_modules missing. Run npm ci"
  exit 1
fi
if ! npx next -v >/dev/null 2>&1; then
  echo "[prebuild] ERROR: next binary unavailable"
  exit 1
fi

echo "[prebuild] Supabase env check (non-blocking)"
if [ -z "${NEXT_PUBLIC_SUPABASE_URL:-}" ] || [ -z "${NEXT_PUBLIC_SUPABASE_ANON_KEY:-}" ]; then
  echo "[prebuild] WARN: missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY"
fi

echo "[prebuild] ok"
