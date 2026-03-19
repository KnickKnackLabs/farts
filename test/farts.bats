#!/usr/bin/env bats

setup() {
  load test_helper
}

# --- get ---

@test "get: extracts scalar field" {
  create_test_file note.md "---
title: My Note
created: 2026-03-18
---

Body here."
  run farts get title "$BATS_TEST_TMPDIR/note.md"
  [ "$status" -eq 0 ]
  [ "$output" = "My Note" ]
}

@test "get: extracts quoted field" {
  create_test_file note.md '---
title: "Quoted Title"
---

Body.'
  run farts get title "$BATS_TEST_TMPDIR/note.md"
  [ "$status" -eq 0 ]
  [ "$output" = "Quoted Title" ]
}

@test "get: extracts list field as lines" {
  create_test_file note.md "---
tags: [guide, tooling, mise]
---

Body."
  run farts get tags "$BATS_TEST_TMPDIR/note.md"
  [ "$status" -eq 0 ]
  [ "${lines[0]}" = "guide" ]
  [ "${lines[1]}" = "tooling" ]
  [ "${lines[2]}" = "mise" ]
}

@test "get: handles wikilinks in list" {
  create_test_file note.md "---
related: [[[other-note]], [[another]]]
---

Body."
  run farts get related "$BATS_TEST_TMPDIR/note.md"
  [ "$status" -eq 0 ]
  [ "${lines[0]}" = "[[other-note]]" ]
  [ "${lines[1]}" = "[[another]]" ]
}

@test "get: missing field exits 1" {
  create_test_file note.md "---
title: Test
---

Body."
  run farts get author "$BATS_TEST_TMPDIR/note.md"
  [ "$status" -eq 1 ]
}

@test "get: no frontmatter exits 1" {
  create_test_file note.md "Just a plain file."
  run farts get title "$BATS_TEST_TMPDIR/note.md"
  [ "$status" -eq 1 ]
}

@test "get: empty list returns nothing" {
  create_test_file note.md "---
tags: []
---

Body."
  run farts get tags "$BATS_TEST_TMPDIR/note.md"
  [ "$status" -eq 0 ]
  [ "$output" = "" ]
}

# --- body ---

@test "body: extracts content after frontmatter" {
  create_test_file note.md "---
title: Test
---

# Heading

Some content."
  run farts body "$BATS_TEST_TMPDIR/note.md"
  [ "$status" -eq 0 ]
  [[ "$output" == *"# Heading"* ]]
  [[ "$output" == *"Some content."* ]]
  [[ "$output" != *"title:"* ]]
}

@test "body: file without frontmatter returns entire content" {
  create_test_file note.md "Just plain text.
Second line."
  run farts body "$BATS_TEST_TMPDIR/note.md"
  [ "$status" -eq 0 ]
  [ "${lines[0]}" = "Just plain text." ]
  [ "${lines[1]}" = "Second line." ]
}

# --- set ---

@test "set: updates existing field" {
  create_test_file note.md "---
title: Old Title
tags: [a]
---

Body."
  farts set title "New Title" "$BATS_TEST_TMPDIR/note.md"
  run farts get title "$BATS_TEST_TMPDIR/note.md"
  [ "$output" = "New Title" ]
  # Other fields preserved
  run farts get tags "$BATS_TEST_TMPDIR/note.md"
  [ "$output" = "a" ]
}

@test "set: adds new field" {
  create_test_file note.md "---
title: Test
---

Body."
  farts set author "rho" "$BATS_TEST_TMPDIR/note.md"
  run farts get author "$BATS_TEST_TMPDIR/note.md"
  [ "$output" = "rho" ]
  # Original field preserved
  run farts get title "$BATS_TEST_TMPDIR/note.md"
  [ "$output" = "Test" ]
}

@test "set: creates frontmatter if none exists" {
  create_test_file note.md "Just plain text."
  farts set title "New Note" "$BATS_TEST_TMPDIR/note.md"
  run farts get title "$BATS_TEST_TMPDIR/note.md"
  [ "$output" = "New Note" ]
  # Body preserved
  run farts body "$BATS_TEST_TMPDIR/note.md"
  [[ "$output" == *"Just plain text."* ]]
}

# --- query ---

@test "query: matches scalar equality" {
  create_test_file a.md "---
title: Alpha
---

A."
  create_test_file b.md "---
title: Beta
---

B."
  run farts query "title = Alpha" "$BATS_TEST_TMPDIR/a.md" "$BATS_TEST_TMPDIR/b.md"
  [ "$status" -eq 0 ]
  [[ "$output" == *"a.md"* ]]
  [[ "$output" != *"b.md"* ]]
}

@test "query: matches list contains" {
  create_test_file a.md "---
tags: [guide, tooling]
---

A."
  create_test_file b.md "---
tags: [reference]
---

B."
  run farts query "tags contains guide" "$BATS_TEST_TMPDIR/a.md" "$BATS_TEST_TMPDIR/b.md"
  [ "$status" -eq 0 ]
  [[ "$output" == *"a.md"* ]]
  [[ "$output" != *"b.md"* ]]
}

@test "query: field exists" {
  create_test_file a.md "---
title: Has Title
---

A."
  create_test_file b.md "---
tags: [x]
---

B."
  run farts query "title exists" "$BATS_TEST_TMPDIR/a.md" "$BATS_TEST_TMPDIR/b.md"
  [ "$status" -eq 0 ]
  [[ "$output" == *"a.md"* ]]
  [[ "$output" != *"b.md"* ]]
}

@test "query: field missing" {
  create_test_file a.md "---
title: Has Title
---

A."
  create_test_file b.md "---
tags: [x]
---

B."
  run farts query "title missing" "$BATS_TEST_TMPDIR/a.md" "$BATS_TEST_TMPDIR/b.md"
  [ "$status" -eq 0 ]
  [[ "$output" != *"a.md"* ]]
  [[ "$output" == *"b.md"* ]]
}

@test "query: date comparison with >" {
  create_test_file old.md "---
created: 2026-01-01
---

Old."
  create_test_file new.md "---
created: 2026-03-15
---

New."
  run farts query "created > 2026-02-01" "$BATS_TEST_TMPDIR/old.md" "$BATS_TEST_TMPDIR/new.md"
  [ "$status" -eq 0 ]
  [[ "$output" == *"new.md"* ]]
  [[ "$output" != *"old.md"* ]]
}

@test "query: inequality" {
  create_test_file a.md "---
type: guide
---

A."
  create_test_file b.md "---
type: reference
---

B."
  run farts query "type != guide" "$BATS_TEST_TMPDIR/a.md" "$BATS_TEST_TMPDIR/b.md"
  [ "$status" -eq 0 ]
  [[ "$output" != *"a.md"* ]]
  [[ "$output" == *"b.md"* ]]
}

# --- init ---

@test "init: adds empty frontmatter" {
  create_test_file note.md "Plain text."
  farts init "$BATS_TEST_TMPDIR/note.md"
  run cat "$BATS_TEST_TMPDIR/note.md"
  [ "${lines[0]}" = "---" ]
  [ "${lines[1]}" = "---" ]
  [[ "$output" == *"Plain text."* ]]
}

@test "init: adds frontmatter with fields" {
  create_test_file note.md "Plain text."
  farts init "$BATS_TEST_TMPDIR/note.md" title="My Note" created=2026-03-18
  run farts get title "$BATS_TEST_TMPDIR/note.md"
  [ "$output" = "My Note" ]
  run farts get created "$BATS_TEST_TMPDIR/note.md"
  [ "$output" = "2026-03-18" ]
  run farts body "$BATS_TEST_TMPDIR/note.md"
  [[ "$output" == *"Plain text."* ]]
}

@test "init: no-op if frontmatter already exists" {
  create_test_file note.md "---
title: Existing
---

Body."
  farts init "$BATS_TEST_TMPDIR/note.md" title="Overwrite?"
  run farts get title "$BATS_TEST_TMPDIR/note.md"
  [ "$output" = "Existing" ]
}

# --- edge cases ---

@test "get: handles frontmatter with no trailing newline" {
  printf '%s' '---
title: Test
---
Body' > "$BATS_TEST_TMPDIR/note.md"
  run farts get title "$BATS_TEST_TMPDIR/note.md"
  [ "$status" -eq 0 ]
  [ "$output" = "Test" ]
}

@test "body: handles frontmatter with no blank line after" {
  printf '%s' '---
title: Test
---
Body line' > "$BATS_TEST_TMPDIR/note.md"
  run farts body "$BATS_TEST_TMPDIR/note.md"
  [ "$status" -eq 0 ]
  [ "$output" = "Body line" ]
}

@test "get: unclosed frontmatter treated as no frontmatter" {
  create_test_file note.md "---
title: Broken
no closing delimiter"
  run farts get title "$BATS_TEST_TMPDIR/note.md"
  [ "$status" -eq 1 ]
}
