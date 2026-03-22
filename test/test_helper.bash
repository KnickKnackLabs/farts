# Tests must be run via `mise run test` (or `farts test`)
if [ -z "${MISE_CONFIG_ROOT:-}" ]; then
  echo "MISE_CONFIG_ROOT not set — run tests via: mise run test" >&2
  exit 1
fi

# farts() wrapper — calls tasks via mise, just like real usage.
# First arg is the subcommand (get, set, init, etc.), rest are task args.
# Exported so subshells can use it too.
farts() {
  if [ -z "${CALLER_PWD:-}" ]; then
    echo "CALLER_PWD not set" >&2
    return 1
  fi
  local subcmd="$1"; shift
  cd "$MISE_CONFIG_ROOT" && CALLER_PWD="$CALLER_PWD" mise run -q "$subcmd" -- "$@"
}
export -f farts

# Create a test file relative to CALLER_PWD
create_test_file() {
  local name="$1"; shift
  printf '%s' "$*" > "$CALLER_PWD/$name"
}
