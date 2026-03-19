/** @jsxImportSource jsx-md */

import { readFileSync, readdirSync } from "fs";
import { join, resolve } from "path";
import {
  Heading, Paragraph, CodeBlock, LineBreak, HR,
  Bold, Code, Link, Italic,
  Badge, Badges, Center, Section,
  Table, TableHead, TableRow, Cell,
  List, Item,
} from "readme/src/components";

const REPO_DIR = resolve(import.meta.dirname);

// Extract task descriptions from .mise/tasks/
const TASK_DIR = join(REPO_DIR, ".mise/tasks");
const tasks = readdirSync(TASK_DIR)
  .filter((f) => f !== "test")
  .map((name) => {
    const src = readFileSync(join(TASK_DIR, name), "utf-8");
    const desc = src.match(/#MISE description="(.+?)"/)?.[1] ?? "";
    const usageLines = [...src.matchAll(/#USAGE arg "(.+?)"(.*)/g)].map((m) => {
      const argName = m[1];
      const help = m[2].match(/help="(.+?)"/)?.[1] ?? "";
      return { argName, help };
    });
    return { name, desc, usageLines };
  })
  .sort((a, b) => a.name.localeCompare(b.name));

// Count tests
const testSrc = readFileSync(join(REPO_DIR, "test/farts.bats"), "utf-8");
const testCount = (testSrc.match(/@test "/g) || []).length;

const readme = (
  <>
    <Center>
      <Heading level={1}>farts</Heading>
      <Paragraph>
        <Bold>Frontmatter parsing CLI for markdown files.</Bold>
      </Paragraph>
      <Badges>
        <Badge label="tests" value={`${testCount} passing`} color="brightgreen" />
        <Badge label="lang" value="python + bash" color="3776AB" logo="python" logoColor="white" />
        <Badge label="license" value="MIT" color="blue" />
      </Badges>
    </Center>

    <Paragraph>
      {"Extract, modify, and query YAML frontmatter in markdown files. "}
      {"Replaces the scattered inline parsers across our codebases with a single reusable tool."}
    </Paragraph>

    <Section title="Install">
      <CodeBlock lang="bash">{`shiv install farts`}</CodeBlock>
    </Section>

    <Section title="Commands">
      <Table>
        <TableHead>
          <Cell>Command</Cell>
          <Cell>Description</Cell>
        </TableHead>
        {tasks.map((t) => (
          <TableRow>
            <Cell>
              <Code>{`farts ${t.name}`}</Code>
            </Cell>
            <Cell>{t.desc}</Cell>
          </TableRow>
        ))}
      </Table>
    </Section>

    <Section title="Usage">
      <Heading level={3}>Get a field</Heading>
      <CodeBlock lang="bash">{`$ farts get title notes/my-note.md
My Note

$ farts get tags notes/my-note.md
guide
tooling
mise`}</CodeBlock>

      <Heading level={3}>Get the body (strip frontmatter)</Heading>
      <CodeBlock lang="bash">{`$ farts body notes/my-note.md
# My Note

Content starts here...`}</CodeBlock>

      <Heading level={3}>Set a field</Heading>
      <CodeBlock lang="bash">{`# Update existing field
$ farts set title "New Title" notes/my-note.md

# Add new field (creates frontmatter if none exists)
$ farts set author rho notes/my-note.md`}</CodeBlock>

      <Heading level={3}>Query files by frontmatter</Heading>
      <CodeBlock lang="bash">{`# Find all guides
$ farts query "tags contains guide" notes/*.md
notes/creating-a-codebase.md
notes/mise-gotchas.md
notes/releasing.md

# Find recent notes
$ farts query "created > 2026-03-01" notes/*.md

# Check field presence
$ farts query "type exists" notes/*.md
$ farts query "author missing" notes/*.md`}</CodeBlock>

      <Heading level={3}>Initialize frontmatter</Heading>
      <CodeBlock lang="bash">{`# Add empty frontmatter
$ farts init README.md

# Add frontmatter with fields
$ farts init README.md title="My Doc" created=2026-03-18`}</CodeBlock>
    </Section>

    <Section title="Query Expressions">
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
    </Section>

    <Section title="Frontmatter Format">
      <Paragraph>
        {"Flat YAML key-value pairs delimited by "}
        <Code>---</Code>
        {". Lists use bracket notation. "}
        <Code>{"[[wikilinks]]"}</Code>
        {" are supported in list values."}
      </Paragraph>
      <CodeBlock lang="yaml">{`---
title: My Note
tags: [guide, tooling]
related: [[[other-note]], [[another]]]
created: 2026-03-18
---`}</CodeBlock>
    </Section>

    <Section title="Development">
      <CodeBlock lang="bash">{`# Run tests
farts test

# Or directly
mise run test`}</CodeBlock>
    </Section>

    <HR />
    <Center>
      <Paragraph>
        <Link href="https://github.com/KnickKnackLabs">KnickKnackLabs</Link>
      </Paragraph>
    </Center>
  </>
);

console.log(readme);
