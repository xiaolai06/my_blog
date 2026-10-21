"""Build a small Markdown metadata index. Python 3.12+, standard library only."""
import argparse
import json
import sys
import tempfile
from dataclasses import asdict, dataclass
from pathlib import Path

KINDS = ("project", "learning", "knowledge", "essay")

@dataclass(frozen=True)
class Note:
    title: str
    type: str
    path: str

def parse_note(path: Path, root: Path) -> tuple[Note, bool]:
    lines = path.read_text(encoding="utf-8-sig").splitlines()
    if not lines or lines[0] != "---":
        raise ValueError(f"{path.name}: missing frontmatter")
    try:
        end = lines.index("---", 1)
    except ValueError:
        raise ValueError(f"{path.name}: unclosed frontmatter") from None
    fields: dict[str, str] = {}
    for line in lines[1:end]:
        if line.startswith((" ", "\t", "#")):
            continue
        key, separator, value = line.partition(":")
        if not separator or key not in {"title", "type", "draft"}:
            continue
        if key in fields:
            raise ValueError(f"{path.name}: duplicate field {key}")
        fields[key] = value.strip()
    title = fields.get("title", "")
    if title.startswith('"'):
        try:
            title = json.loads(title)
        except json.JSONDecodeError:
            raise ValueError(f"{path.name}: invalid quoted title") from None
    elif title.startswith(("'", "|", ">")):
        raise ValueError(f"{path.name}: use a plain or JSON-quoted title")
    if not isinstance(title, str) or not title.strip():
        raise ValueError(f"{path.name}: empty title")
    kind, draft = fields.get("type", ""), fields.get("draft", "true")
    if kind not in KINDS:
        raise ValueError(f"{path.name}: invalid type {kind!r}")
    if draft not in {"true", "false"}:
        raise ValueError(f"{path.name}: draft must be true or false")
    return Note(title.strip(), kind, path.relative_to(root).as_posix()), draft == "true"

def collect(root: Path, query: str = "", kind: str | None = None) -> list[Note]:
    root = root.resolve()
    if not root.is_dir():
        raise ValueError("notes directory does not exist")
    result: list[Note] = []
    for path in sorted(root.rglob("*.md")):
        if path.is_symlink() or not path.resolve().is_relative_to(root):
            continue
        note, draft = parse_note(path, root)
        if not draft and (kind is None or note.type == kind):
            if query.casefold() in note.title.casefold():
                result.append(note)
    return result

def write_index(notes: list[Note], output: Path) -> None:
    if output.suffix.lower() != ".json":
        raise ValueError("output must have a .json extension")
    output.parent.mkdir(parents=True, exist_ok=True)
    temporary: Path | None = None
    try:
        with tempfile.NamedTemporaryFile(
            mode="w", encoding="utf-8", dir=output.parent,
            prefix=f".{output.name}.", suffix=".tmp", delete=False,
        ) as stream:
            temporary = Path(stream.name)
            json.dump([asdict(note) for note in notes], stream, ensure_ascii=False, indent=2)
            stream.write("\n")
        temporary.replace(output)
    finally:
        if temporary is not None:
            temporary.unlink(missing_ok=True)

def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Index published Markdown notes")
    parser.add_argument("directory", type=Path)
    parser.add_argument("--query", default="")
    parser.add_argument("--type", choices=KINDS, dest="kind")
    parser.add_argument("--output", type=Path, default=Path("index.json"))
    args = parser.parse_args(argv)
    try:
        notes = collect(args.directory, args.query, args.kind)
        write_index(notes, args.output)
    except (OSError, ValueError) as error:
        print(f"error: {error}", file=sys.stderr)
        return 2
    print(f"Indexed {len(notes)} note(s) -> {args.output}")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
