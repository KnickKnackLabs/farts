# farts

Frontmatter parsing CLI. Extracts, modifies, and queries YAML frontmatter in markdown files.

## Structure

```
farts/
├── mise.toml          # Dependencies (python, bats, usage)
├── .mise/tasks/       # CLI commands (get, body, set, query, init)
├── lib/farts.py       # Core parsing/manipulation library
└── test/              # BATS tests
```

## Commands

- `farts get <field> <file>` — extract a field value (list fields print one item per line)
- `farts body <file>` — content after frontmatter
- `farts set <field> <value> <file>` — set or update a field (modifies file in place)
- `farts query "<expr>" <files...>` — filter files by frontmatter (prints matching paths)
- `farts init <file> [field=value...]` — add frontmatter to a file that lacks it

## Query expressions

- `field = value` — exact match or list membership
- `field != value` — negation
- `field contains value` — substring or list membership
- `field > value` / `field < value` — string comparison (works for ISO dates)
- `field exists` / `field missing` — presence check

## Frontmatter format

```yaml
---
title: My Note
tags: [guide, tooling]
related: [[[other-note]], [[another]]]
created: 2026-03-18
---
```

Flat key-value pairs. Lists use bracket notation `[a, b, c]`. Wikilinks `[[slug]]` are supported in list values.

## Development

Tasks use `$MISE_CONFIG_ROOT` to locate `lib/farts.py`. Run tests with `mise run test`.
