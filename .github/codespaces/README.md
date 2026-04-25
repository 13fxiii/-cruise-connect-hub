# Codespaces prebuild notes

This repository is configured for fast GitHub Codespaces startup with `.devcontainer/devcontainer.json`.

## Prebuild-safe command split

- `onCreateCommand` installs dependencies with `npm ci`; this is the heavy step and is safe for prebuild execution.
- `postCreateCommand` only verifies tool versions, so new codespaces open quickly and avoid failures caused by missing local secrets.

## Recommended repository settings

In **GitHub → Settings → Codespaces → Prebuild configurations**:

1. Enable prebuilds for the default branch.
2. Trigger on configuration changes and weekly refresh.
3. Keep at least one prebuild instance warm.
