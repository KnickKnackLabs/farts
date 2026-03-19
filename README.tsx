/** @jsxImportSource jsx-md */

import { readFileSync, readdirSync } from "fs";
import { join, resolve } from "path";
import {
  Heading, Paragraph, CodeBlock, LineBreak, HR,
  Bold, Code, Link, Italic,
  Badge, Badges, Center, Section,
  Table, TableHead, TableRow, Cell,
  List, Item,
  Raw, HtmlLink, Sub,
} from "readme/src/components";

// ── Dynamic data ─────────────────────────────────────────────

const REPO_DIR = resolve(import.meta.dirname);
const TASK_DIR = join(REPO_DIR, ".mise/tasks");

// Extract commands from task files
const tasks = readdirSync(TASK_DIR)
  .filter((f) => f !== "test")
  .map((name) => {
    const src = readFileSync(join(TASK_DIR, name), "utf-8");
    const desc = src.match(/#MISE description="(.+?)"/)?.[1] ?? "";
    const args = [...src.matchAll(/#USAGE arg "(<?.+?>?)" help="(.+?)"/g)].map(
      (m) => m[1],
    );
    return { name, desc, usage: `farts ${name} ${args.join(" ")}`.trim() };
  })
  .filter((t) => t.desc)
  .sort((a, b) => a.name.localeCompare(b.name));

// Count tests
const testSrc = readFileSync(join(REPO_DIR, "test/farts.bats"), "utf-8");
const testCount = (testSrc.match(/@test "/g) || []).length;

// ── Helpers ──────────────────────────────────────────────────

function box(lines: string[], { padding = 1 }: { padding?: number } = {}): string {
  const maxLen = Math.max(...lines.map((l) => l.length));
  const w = maxLen + padding * 2;
  const pad = (s: string) => " ".repeat(padding) + s + " ".repeat(w - s.length - padding);
  const top = "┌" + "─".repeat(w) + "┐";
  const bot = "└" + "─".repeat(w) + "┘";
  return [top, ...lines.map((l) => "│" + pad(l) + "│"), bot].join("\n");
}

const hero = box([
  "---",
  "title: Your Note",
  "tags: [important]",
  "---",
  "",
  "$ farts get title note.md",
  "Your Note",
], { padding: 2 });

// ── README ───────────────────────────────────────────────────

const readme = (
  <>
    <Center>
      <Raw>{`<pre>\n${hero}\n</pre>\n\n`}</Raw>

      <Heading level={1}>farts</Heading>

      <Paragraph>
        <Bold>Frontmatter parsing CLI for markdown files.</Bold>
      </Paragraph>

      <Paragraph>
        {"Read it. Write it. Query it. No more artisanal awk parsers."}
      </Paragraph>

      <Badges>
        <Badge label="tests" value={`${testCount} passing`} color="brightgreen" />
        <Badge label="lang" value="python + bash" color="3776AB" logo="python" logoColor="white" />
        <Badge label="license" value="MIT" color="blue" href="LICENSE" />
      </Badges>
    </Center>

    <LineBreak />

    <Section title="Install">
      <CodeBlock lang="bash">{`shiv install farts`}</CodeBlock>
    </Section>

    <LineBreak />

    <Section title="Quick start">
      <CodeBlock lang="bash">{`# Read a field
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
$ farts init README.md title="My Doc"`}</CodeBlock>
    </Section>

    <LineBreak />

    <Section title="Commands">
      <Paragraph>
        {"Generated from "}
        <Code>.mise/tasks/</Code>
        {` — ${tasks.length} commands:`}
      </Paragraph>

      <Table>
        <TableHead>
          <Cell>Command</Cell>
          <Cell>Description</Cell>
        </TableHead>
        {tasks.map((t) => (
          <TableRow>
            <Cell><Code>{t.usage}</Code></Cell>
            <Cell>{t.desc}</Cell>
          </TableRow>
        ))}
      </Table>
    </Section>

    <LineBreak />

    <Section title="Query expressions">
      <Paragraph>
        <Code>farts query</Code>
        {" filters files using simple expressions:"}
      </Paragraph>

      <Table>
        <TableHead>
          <Cell>Expression</Cell>
          <Cell>Meaning</Cell>
        </TableHead>
        <TableRow>
          <Cell><Code>field = value</Code></Cell>
          <Cell>Exact match (scalar) or list membership</Cell>
        </TableRow>
        <TableRow>
          <Cell><Code>field != value</Code></Cell>
          <Cell>Negation</Cell>
        </TableRow>
        <TableRow>
          <Cell><Code>field contains value</Code></Cell>
          <Cell>Substring (scalar) or membership (list)</Cell>
        </TableRow>
        <TableRow>
          <Cell><Code>{`field > value`}</Code></Cell>
          <Cell>String comparison (works for ISO dates)</Cell>
        </TableRow>
        <TableRow>
          <Cell><Code>{`field < value`}</Code></Cell>
          <Cell>String comparison</Cell>
        </TableRow>
        <TableRow>
          <Cell><Code>field exists</Code></Cell>
          <Cell>Field is present</Cell>
        </TableRow>
        <TableRow>
          <Cell><Code>field missing</Code></Cell>
          <Cell>Field is absent</Cell>
        </TableRow>
      </Table>

      <CodeBlock lang="bash">{`# Find all guides
$ farts query "tags contains guide" notes/*.md
notes/creating-a-codebase.md
notes/mise-gotchas.md
notes/releasing.md

# Notes created this month
$ farts query "created > 2026-03-01" notes/*.md

# Notes missing an author
$ farts query "author missing" notes/*.md`}</CodeBlock>
    </Section>

    <LineBreak />

    <Section title="Frontmatter format">
      <Paragraph>
        {"YAML frontmatter delimited by "}
        <Code>---</Code>
        {". Parsed with PyYAML — standard YAML features work, including multi-line lists. "}
        <Code>{"[[wikilinks]]"}</Code>
        {" are preserved in list values."}
      </Paragraph>

      <CodeBlock lang="yaml">{`---
title: My Note
tags: [guide, tooling]
signals:
  - no-agency
  - binge
related: [[[other-note]], [[another]]]
created: 2026-03-18
---`}</CodeBlock>

      <Paragraph>
        <Bold>Note:</Bold>
        {" PyYAML applies standard YAML type coercion — dates become "}
        <Code>datetime.date</Code>
        {", "}
        <Code>yes</Code>
        {"/"}
        <Code>no</Code>
        {" become booleans, bare numbers become ints. This aligns with how Hugo/Jekyll/Obsidian parse frontmatter."}
      </Paragraph>
    </Section>

    <LineBreak />

    <Section title="Development">
      <CodeBlock lang="bash">{`git clone https://github.com/KnickKnackLabs/farts.git
cd farts && mise trust && mise install
mise run test`}</CodeBlock>

      <Paragraph>
        {`${testCount} tests using `}
        <Link href="https://github.com/bats-core/bats-core">BATS</Link>
        {"."}
      </Paragraph>
    </Section>

    <LineBreak />

    <Center>
      <HR />

      <Sub>
        {"Every codebase had its own frontmatter parser."}
        <Raw>{"<br />"}</Raw>{"\n"}
        {"Now there's one."}
        <Raw>{"<br />"}</Raw>{"\n"}
        <Raw>{"<br />"}</Raw>{"\n"}
        {"This README was created using "}
        <HtmlLink href="https://github.com/KnickKnackLabs/readme">readme</HtmlLink>
        {"."}
      </Sub>
    </Center>
  </>
);

console.log(readme);
