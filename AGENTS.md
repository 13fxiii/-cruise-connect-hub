# Cruise Connect Hub — Agent Operating Guide

This file applies to the entire repository.

## Mission
Keep changes small, deploy-safe, and production-focused.

## Guardrails
- Do not add major features when a stabilization or deployment task is requested.
- Prioritize: deploy stability, onboarding reliability, Supabase realtime reliability, and mobile UX.
- Prefer minimal diffs and backwards-compatible fixes.

## Supabase Rules (Single Source of Truth)
- Use `src/lib/supabase/config.ts` as the canonical source of Supabase URL/key/schema values.
- Do **not** duplicate Supabase env parsing in other files.
- Do **not** introduce hardcoded fallback project URL or fallback anon/service keys.
- If required Supabase env values are missing in production, fail fast with a clear error.
- Keep `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and server-side keys aligned to one project per environment.

## Onboarding + Auth Reliability
- Any auth/onboarding change must preserve redirect safety (`/onboarding` for incomplete profiles).
- Do not introduce open-redirect behavior; only allow safe internal redirect paths.
- Preserve degraded-mode behavior where appropriate (e.g., avoid hard-locking users on transient profile lookup failures).

## Realtime Reliability
- Realtime subscriptions must clean up channels on unmount.
- Avoid duplicate subscriptions and re-subscribe loops.
- Keep payload handlers lightweight and resilient.

## Mobile-first Quality Bar
- Test key routes in narrow viewport assumptions (feed, onboarding, games hub, messages).
- Avoid layout regressions that hide primary CTA/actions on small screens.

## Required Checks Before PR
Run these before opening/updating a PR:
1. `npm ci`
2. `npm run build`
3. `npm run lint`

If a check fails, include the exact failure and smallest fix needed.

## PR Scope + Messaging
- Keep PRs tightly scoped.
- Include a short risk note and rollback plan in PR body for production-facing changes.
- Mention exactly what was validated for onboarding and realtime.
