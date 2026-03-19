<div align="center">

<pre>
┌─────────────────────────────┐
│  ---                        │
│  title: Your Note           │
│  tags: [important]          │
│  ---                        │
│                             │
│  $ farts get title note.md  │
│  Your Note                  │
└─────────────────────────────┘
</pre>

# farts

**Frontmatter parsing CLI for markdown files.**

Read it. Write it. Query it. No more artisanal awk parsers.

![tests: 24 passing](https://img.shields.io/badge/tests-24%20passing-brightgreen?style=flat)
![lang: python + bash](https://img.shields.io/badge/lang-python%20%2B%20bash-3776AB?style=flat&logo=python&logoColor=white)
[![license: MIT](https://img.shields.io/badge/license-MIT-blue?style=flat)](LICENSE)

</div>

<br />

## Install

```bash
shiv install farts
```

<br />

## Quick start

```bash
# Read a field
$ farts get title notes/my-note.md
My Note

# Read tags (one per line)
$ farts get tags notes/my-note.md
guide
tooling

# Strip frontmatter, get the content
$ farts body notes/my-note.md

# Set a field (in place)
$ farts set created 2026-03-18 notes/my-note.md

# Find notes by frontmatter
$ farts query "tags contains guide" notes/*.md

# Add frontmatter to a bare file
$ farts init README.md title="My Doc"
```

<br />

## Commands

Generated from `.mise/tasks/` — 5 commands:

| Command | Description |
| --- | --- |
| `farts body <file>` | Extract content after frontmatter |
| `farts get <field> <file>` | Extract a frontmatter field value |
| `farts init <file>` | Initialize frontmatter on a file |
| `farts query <expr>` | Filter files by frontmatter fields |
| `farts set <field> <value> <file>` | Set a frontmatter field value |

<br />

## Query expressions

`farts query` filters files using simple expressions:

| Expression | Meaning |
| --- | --- |
| `field = value` | Exact match (scalar) or list membership |
| `field != value` | Negation |
| `field contains value` | Substring (scalar) or membership (list) |
| `field > value` | String comparison (works for ISO dates) |
| `field < value` | String comparison |
| `field exists` | Field is present |
| `field missing` | Field is absent |

```bash
# Find all guides
$ farts query "tags contains guide" notes/*.md
notes/creating-a-codebase.md
notes/mise-gotchas.md
notes/releasing.md

# Notes created this month
$ farts query "created > 2026-03-01" notes/*.md

# Notes missing an author
$ farts query "author missing" notes/*.md
```

<br />

## Frontmatter format

Flat YAML key-value pairs delimited by `---`. Lists use bracket notation. `[[wikilinks]]` are preserved in list values.

```yaml
---
title: My Note
tags: [guide, tooling]
related: [[[other-note]], [[another]]]
created: 2026-03-18
---
```

<br />

## Development

```bash
git clone https://github.com/KnickKnackLabs/farts.git
cd farts && mise trust && mise install
mise run test
```

24 tests using [BATS](https://github.com/bats-core/bats-core).

<br />

<div align="center">

---

<sub>
Every codebase had its own frontmatter parser.<br />
Now there's one.<br />
<br />
This README was created using <a href="https://github.com/KnickKnackLabs/readme">readme</a>.
</sub></div>
