"""farts — frontmatter parsing and manipulation.

Pure stdlib. No external dependencies.

Frontmatter is a YAML block delimited by --- lines at the top of a markdown file.
We handle flat key-value pairs and simple bracket-notation lists [a, b, c].
We handle [[wikilinks]] in related fields.
"""

import sys
import re


def parse_frontmatter(text):
    """Parse frontmatter from text. Returns (fields dict, body str, raw_fm_lines list).

    raw_fm_lines includes the --- delimiters for faithful reconstruction.
    """
    lines = text.split("\n")
    fields = {}
    fm_lines = []
    body_start = 0

    if not lines or lines[0].strip() != "---":
        return {}, text, []

    fm_lines.append(lines[0])
    in_fm = True
    for i, line in enumerate(lines[1:], 1):
        if line.strip() == "---":
            fm_lines.append(line)
            body_start = i + 1
            in_fm = False
            break
        fm_lines.append(line)
        key, _, val = line.partition(":")
        if val:
            key = key.strip()
            val = val.strip()
            fields[key] = _parse_value(val)
    else:
        # No closing ---, treat entire content as body
        return {}, text, []

    body = "\n".join(lines[body_start:])
    # Strip single leading newline between frontmatter and body
    if body.startswith("\n"):
        body = body[1:]

    return fields, body, fm_lines


def _parse_value(val):
    """Parse a frontmatter value string into a Python value."""
    # Strip surrounding quotes
    if (val.startswith('"') and val.endswith('"')) or \
       (val.startswith("'") and val.endswith("'")):
        return val[1:-1]

    # Bracket-notation list: [a, b, c] or [[[link]], [[link2]]]
    if val.startswith("[") and val.endswith("]"):
        inner = val[1:-1].strip()
        if not inner:
            return []
        # Handle [[wikilinks]] — split on comma but respect brackets
        items = _split_list(inner)
        return [item.strip().strip("'\"") for item in items]

    return val


def _split_list(s):
    """Split a frontmatter list value on commas, respecting [[wikilinks]]."""
    items = []
    depth = 0
    current = []
    for char in s:
        if char == "[":
            depth += 1
            current.append(char)
        elif char == "]":
            depth -= 1
            current.append(char)
        elif char == "," and depth == 0:
            items.append("".join(current))
            current = []
        else:
            current.append(char)
    if current:
        items.append("".join(current))
    return items


def format_value(val):
    """Format a Python value back to frontmatter string."""
    if isinstance(val, list):
        return "[" + ", ".join(str(v) for v in val) + "]"
    return str(val)


def get_field(text, field):
    """Get a single field value from frontmatter. Returns None if not found."""
    fields, _, _ = parse_frontmatter(text)
    return fields.get(field)


def get_body(text):
    """Get the body (everything after frontmatter)."""
    _, body, _ = parse_frontmatter(text)
    return body


def set_field(text, field, value):
    """Set a field in frontmatter. Creates frontmatter if none exists."""
    fields, body, fm_lines = parse_frontmatter(text)

    if not fm_lines:
        # No frontmatter — create it
        return "---\n{}: {}\n---\n\n{}".format(field, value, text)

    # Check if field already exists — replace in place
    new_fm_lines = []
    replaced = False
    for line in fm_lines:
        if line.strip() == "---":
            new_fm_lines.append(line)
            continue
        key, sep, _ = line.partition(":")
        if sep and key.strip() == field:
            new_fm_lines.append("{}: {}".format(field, value))
            replaced = True
        else:
            new_fm_lines.append(line)

    # Field doesn't exist yet — add before closing ---
    if not replaced:
        new_fm_lines.insert(-1, "{}: {}".format(field, value))

    return "\n".join(new_fm_lines) + "\n\n" + body


def init_frontmatter(text, fields=None):
    """Initialize frontmatter on a file that doesn't have any."""
    existing, body, fm_lines = parse_frontmatter(text)
    if fm_lines:
        return text  # Already has frontmatter

    if fields is None:
        fields = {}

    fm = "---\n"
    for k, v in fields.items():
        fm += "{}: {}\n".format(k, format_value(v) if isinstance(v, list) else v)
    fm += "---\n\n"
    return fm + text


def matches_query(fields, expr):
    """Evaluate a simple query expression against fields.

    Supported expressions:
      field = value        — exact match (scalar) or list contains (list field)
      field != value       — negation
      field contains value — substring match (scalar) or membership (list)
      field > value        — string comparison (works for ISO dates)
      field < value        — string comparison
      field exists         — field is present
      field missing        — field is absent
    """
    expr = expr.strip()

    # "field exists" / "field missing"
    m = re.match(r'^(\w+)\s+(exists|missing)$', expr)
    if m:
        field, op = m.group(1), m.group(2)
        return (field in fields) if op == "exists" else (field not in fields)

    # "field op value"
    m = re.match(r'^(\w+)\s+(=|!=|contains|>|<)\s+(.+)$', expr)
    if not m:
        print("farts: invalid query expression: {}".format(expr), file=sys.stderr)
        return False

    field, op, value = m.group(1), m.group(2), m.group(3).strip()
    fval = fields.get(field)

    if fval is None:
        return op == "!="

    if isinstance(fval, list):
        if op == "=" or op == "contains":
            return value in fval
        elif op == "!=":
            return value not in fval
        return False

    # Scalar comparison
    if op == "=":
        return str(fval) == value
    elif op == "!=":
        return str(fval) != value
    elif op == "contains":
        return value in str(fval)
    elif op == ">":
        return str(fval) > value
    elif op == "<":
        return str(fval) < value

    return False


def main():
    if len(sys.argv) < 2:
        print("Usage: farts.py <command> [args...]", file=sys.stderr)
        sys.exit(1)

    cmd = sys.argv[1]

    if cmd == "get":
        if len(sys.argv) < 4:
            print("Usage: farts.py get <field> <file>", file=sys.stderr)
            sys.exit(1)
        field, path = sys.argv[2], sys.argv[3]
        with open(path) as f:
            text = f.read()
        val = get_field(text, field)
        if val is None:
            sys.exit(1)
        if isinstance(val, list):
            for item in val:
                print(item)
        else:
            print(val)

    elif cmd == "body":
        if len(sys.argv) < 3:
            print("Usage: farts.py body <file>", file=sys.stderr)
            sys.exit(1)
        path = sys.argv[2]
        with open(path) as f:
            text = f.read()
        body = get_body(text)
        print(body, end="")

    elif cmd == "set":
        if len(sys.argv) < 5:
            print("Usage: farts.py set <field> <value> <file>", file=sys.stderr)
            sys.exit(1)
        field, value, path = sys.argv[2], sys.argv[3], sys.argv[4]
        with open(path) as f:
            text = f.read()
        result = set_field(text, field, value)
        with open(path, "w") as f:
            f.write(result)

    elif cmd == "query":
        if len(sys.argv) < 4:
            print("Usage: farts.py query <expr> <file>...", file=sys.stderr)
            sys.exit(1)
        expr = sys.argv[2]
        files = sys.argv[3:]
        for path in files:
            try:
                with open(path) as f:
                    text = f.read()
                fields, _, _ = parse_frontmatter(text)
                if matches_query(fields, expr):
                    print(path)
            except (OSError, IOError):
                continue

    elif cmd == "init":
        if len(sys.argv) < 3:
            print("Usage: farts.py init <file> [field=value...]", file=sys.stderr)
            sys.exit(1)
        path = sys.argv[2]
        fields = {}
        for arg in sys.argv[3:]:
            k, _, v = arg.partition("=")
            if v:
                fields[k] = v
        with open(path) as f:
            text = f.read()
        result = init_frontmatter(text, fields if fields else None)
        with open(path, "w") as f:
            f.write(result)

    else:
        print("farts: unknown command: {}".format(cmd), file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
