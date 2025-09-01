#!/usr/bin/env bash
set -euo pipefail

echo "Running forbidden inline styles check (style={{ ... }})..."

# Allowlist patterns (comma-separated ripgrep globs)
ALLOWED=(
  # Charts or places still pending cleanup (adjust as needed)
  "src/components/ImpactVisualization.js"
)

ARGS=("-n" "style=\\{\\{" "src")
for patt in "${ALLOWED[@]}"; do
  ARGS+=(--glob "!$patt")
done

violations=$(rg "${ARGS[@]}" || true)

if [[ -n "$violations" ]]; then
  echo "Inline styles detected in the following locations:" >&2
  echo "$violations" >&2
  if [[ "${ENFORCE_INLINE_STYLES:-false}" == "true" ]]; then
    echo "Set allowlist or refactor to CSS modules before merging." >&2
    exit 1
  else
    echo "Warning: Inline styles found (non-blocking). Set ENFORCE_INLINE_STYLES=true to enforce." >&2
  fi
else
  echo "No forbidden inline styles found."
fi

