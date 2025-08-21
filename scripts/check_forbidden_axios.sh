#!/usr/bin/env bash
set -euo pipefail

# Disallow direct axios usage outside approved files.
# Allowed files:
# - src/services/api.service.js
# - src/services/csrf.service.js
# - src/contexts/AuthContext.js

echo "Running forbidden axios usage check..."

violations=$(rg -n "\bimport\\s+axios\b|\baxios\\.(get|post|put|delete|patch)\\(" src \
  --glob '!src/services/api.service.js' \
  --glob '!src/services/csrf.service.js' \
  --glob '!src/contexts/AuthContext.js' || true)

if [[ -n "$violations" ]];
then
  echo "Forbidden axios usage detected in the following locations:" >&2
  echo "$violations" >&2
  echo "Use apiServices.client or apiClient from src/services/api.service.js instead." >&2
  exit 1
else
  echo "No forbidden axios usage found."
fi

