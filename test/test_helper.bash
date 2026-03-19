FARTS_PY="$BATS_TEST_DIRNAME/../lib/farts.py"

# Create a test markdown file with frontmatter
# Usage: create_test_file <filename> <content>
create_test_file() {
  local name="$1"
  shift
  printf '%s' "$*" > "$BATS_TEST_TMPDIR/$name"
}

# Shorthand to run farts.py
farts() {
  python3 "$FARTS_PY" "$@"
}
