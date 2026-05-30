#!/usr/bin/env bash
set -euo pipefail

echo "[risk] calculating baseline risk"

risk=0

if rg -n "<img[[:space:]>]" src >/dev/null 2>&1; then
  risk=$((risk + 20))
  echo "[risk] WARN: raw <img> usage contributes +20"
fi
if rg -n "useEffect\(" src | rg -n "supabase" >/dev/null 2>&1; then
  risk=$((risk + 10))
  echo "[risk] WARN: hook/supabase hotspots contribute +10"
fi

if rg -n "xiyjgcoeljquryixmfut\.supabase\.co|SUPABASE_URL\s*\|\||SUPABASE_ANON_KEY\s*\|\|" src/lib >/dev/null 2>&1; then
  risk=$((risk + 50))
  echo "[risk] WARN: Supabase fallback/duplication patterns detected in src/lib (+50)"
fi

echo "[risk] score=${risk}/100"
echo "[risk] acceptable"
