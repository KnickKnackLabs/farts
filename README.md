<div align="center">

# farts

**Frontmatter parsing CLI for markdown files.**

![tests: 24 passing](https://img.shields.io/badge/tests-24%20passing-brightgreen?style=flat)
![lang: python + bash](https://img.shields.io/badge/lang-python%20%2B%20bash-3776AB?style=flat&logo=python&logoColor=white)
![license: MIT](https://img.shields.io/badge/license-MIT-blue?style=flat)

</div>

Extract, modify, and query YAML frontmatter in markdown files. Replaces the scattered inline parsers across our codebases with a single reusable tool.

## Install

```bash
shiv install farts
```

## Commands

| Command | Description |
| --- | --- |
| `farts body` | Extract content after frontmatter |
| `farts get` | Extract a frontmatter field value |
| `farts init` | Initialize frontmatter on a file |
| `farts query` | Filter files by frontmatter fields |
| `farts set` | Set a frontmatter field value |

## Usage

### Get a field

```bash
$ farts get title notes/my-note.md
My Note

$ farts get tags notes/my-note.md
guide
tooling
mise
```

### Get the body (strip frontmatter)

```bash
$ farts body notes/my-note.md
# My Note

Content starts here...
```

### Set a field

```bash
# Update existing field
$ farts set title "New Title" notes/my-note.md

# Add new field (creates frontmatter if none exists)
$ farts set author rho notes/my-note.md
```

### Query files by frontmatter

```bash
# Find all guides
$ farts query "tags contains guide" notes/*.md
notes/creating-a-codebase.md
notes/mise-gotchas.md
notes/releasing.md

# Find recent notes
$ farts query "created > 2026-03-01" notes/*.md

# Check field presence
$ farts query "type exists" notes/*.md
$ farts query "author missing" notes/*.md
```

### Initialize frontmatter

```bash
# Add empty frontmatter
$ farts init README.md

# Add frontmatter with fields
$ farts init README.md title="My Doc" created=2026-03-18
```

## Query Expressions

| Expression | Meaning |
| --- | --- |
| `field = value` | Exact match (scalar) or list membership |
| `field != value` | Negation |
| `field contains value` | Substring (scalar) or membership (list) |
| `field > value` | String comparison (works for ISO dates) |
| `field < value` | String comparison |
| `field exists` | Field is present |
| `field missing` | Field is absent |

## Frontmatter Format

Flat YAML key-value pairs delimited by `---`. Lists use bracket notation. `[[wikilinks]]` are supported in list values.

```yaml
---
title: My Note
tags: [guide, tooling]
related: [[[other-note]], [[another]]]
created: 2026-03-18
---
```

## Development

```bash
# Run tests
farts test

# Or directly
mise run test
```

---

<div align="center">

[KnickKnackLabs](https://github.com/KnickKnackLabs)

</div>
