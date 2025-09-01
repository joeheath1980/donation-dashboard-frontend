#!/usr/bin/env bash
set -euo pipefail

echo "Scanning for suspicious comments and debug code..."

# Terms to flag: TODO, FIXME, HACK, DEBUG, console.log, debugger
PATTERN="(TODO|FIXME|HACK|DEBUG|console\.log\(|debugger;)"

violations=$(rg -n -H -S --pcre2 "$PATTERN" src || true)

if [[ -n "$violations" ]]; then
  echo "Potentially sensitive comments or debug code found:" >&2
  echo "$violations" >&2
  if [[ "${ENFORCE_SUSPICIOUS_COMMENTS:-false}" == "true" ]]; then
    echo "Please remove or suppress before merging (set ENFORCE_SUSPICIOUS_COMMENTS=false to disable)." >&2
    exit 1
  else
    echo "Warning: Non-blocking; set ENFORCE_SUSPICIOUS_COMMENTS=true to enforce." >&2
  fi
else
  echo "No suspicious comments or debug code found."
fi

