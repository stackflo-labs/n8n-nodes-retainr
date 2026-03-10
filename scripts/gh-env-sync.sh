#!/usr/bin/env bash
# gh-env-sync.sh — sync .env.<environment> to GitHub Actions secrets + variables
#
# Usage:
#   ./scripts/gh-env-sync.sh production
#   ./scripts/gh-env-sync.sh staging
#
# Prerequisites:
#   - gh CLI installed and authenticated (gh auth login)
#   - .env.<environment> file exists in repo root
#
# Convention:
#   Variables whose keys match the SECRET_KEYS pattern below are pushed as
#   GitHub Actions encrypted SECRETS. All other non-empty variables are pushed
#   as plaintext GitHub Actions VARIABLES.
#
# GitHub environments are created idempotently — safe to run multiple times.

set -euo pipefail

# ── Args ──────────────────────────────────────────────────────────────────────

ENV_NAME="${1:-}"
if [[ -z "$ENV_NAME" ]]; then
  echo "Usage: $0 <environment>   (e.g. production, staging)" >&2
  exit 1
fi

ENV_FILE=".env.${ENV_NAME}"
if [[ ! -f "$ENV_FILE" ]]; then
  echo "Error: $ENV_FILE not found. Copy .env.${ENV_NAME}.example → $ENV_FILE and fill it in." >&2
  exit 1
fi

# ── Detect repo ───────────────────────────────────────────────────────────────

if ! command -v gh &>/dev/null; then
  echo "Error: gh CLI not installed. See https://cli.github.com" >&2
  exit 1
fi

REPO=$(gh repo view --json nameWithOwner -q .nameWithOwner 2>/dev/null || true)
if [[ -z "$REPO" ]]; then
  echo "Error: not in a GitHub repo or gh is not authenticated (run: gh auth login)" >&2
  exit 1
fi

echo "Repository : $REPO"
echo "Environment: $ENV_NAME"
echo "Source file: $ENV_FILE"
echo ""

# ── Create environment idempotently ───────────────────────────────────────────
# PUT is idempotent — creates if missing, no-ops if already present

echo "→ Ensuring GitHub environment '$ENV_NAME' exists..."
gh api --method PUT "repos/${REPO}/environments/${ENV_NAME}" \
  --field wait_timer=0 \
  --silent
echo "  ✓ environment ready"
echo ""

# ── Secret key detection ──────────────────────────────────────────────────────
# Keys matching this pattern are pushed as encrypted secrets; others as vars.
# Add to this pattern if you have additional sensitive key names.

is_secret() {
  local key="$1"
  # Keys ending with these suffixes → secret
  [[ "$key" =~ (KEY|SECRET|TOKEN|PASSWORD|WEBHOOK)$ ]] && return 0
  # Special full-key matches
  case "$key" in
    DATABASE_URL|VPS_SSH_KEY|ANTHROPIC_API_KEY|GITHUB_DISPATCH_TOKEN|\
    DOKPLOY_PRODUCTION_WEBHOOK|DOKPLOY_PRODUCTION_ROLLBACK_WEBHOOK|DOKPLOY_STAGING_WEBHOOK|\
    GH_BOT_TOKEN) return 0 ;;
  esac
  return 1
}

# ── Parse and sync ────────────────────────────────────────────────────────────

secrets_set=0
vars_set=0
skipped=0

while IFS= read -r line || [[ -n "$line" ]]; do
  # Skip blank lines
  [[ -z "${line// }" ]] && continue
  # Skip comment lines
  [[ "$line" =~ ^[[:space:]]*# ]] && continue

  # Parse KEY=VALUE — value may itself contain '='
  KEY="${line%%=*}"
  VALUE="${line#*=}"

  # Skip malformed lines
  [[ -z "$KEY" ]] && continue

  # Skip keys with empty values — don't overwrite existing secrets with blanks
  if [[ -z "$VALUE" ]]; then
    printf "  skip    %-40s (empty value)\n" "$KEY"
    ((skipped++)) || true
    continue
  fi

  if is_secret "$KEY"; then
    printf "  secret  %s\n" "$KEY"
    gh secret set "$KEY" \
      --env "$ENV_NAME" \
      --repo "$REPO" \
      --body "$VALUE"
    ((secrets_set++)) || true
  else
    printf "  var     %-40s = %s\n" "$KEY" "$VALUE"
    gh variable set "$KEY" \
      --env "$ENV_NAME" \
      --repo "$REPO" \
      --body "$VALUE"
    ((vars_set++)) || true
  fi
done < "$ENV_FILE"

echo ""
echo "Done."
echo "  Secrets set : $secrets_set"
echo "  Variables set: $vars_set"
echo "  Skipped (empty): $skipped"
echo ""
echo "View at: https://github.com/${REPO}/settings/environments"
