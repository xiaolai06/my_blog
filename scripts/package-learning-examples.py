"""Package the canonical teaching project without local secrets or generated files."""

from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile
import argparse

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "src" / "examples" / "fastapi-notes"
OUTPUT = ROOT / "public" / "examples" / "fastapi-notes.zip"
FILES = [
    ".env.example",
    "README.md",
    "requirements.txt",
    "requirements-tested.txt",
    "app/__init__.py",
    "app/config.py",
    "app/models.py",
    "app/dependencies.py",
    "app/routes.py",
    "app/main.py",
    "tests/test_notes.py",
]


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true", help="Verify the committed ZIP without rewriting it")
    args = parser.parse_args()
    # Resolve every input before writing, and use an explicit allowlist.
    sources = [(name, (SOURCE / name).read_bytes().replace(b"\r\n", b"\n")) for name in FILES]
    if not args.check:
        OUTPUT.parent.mkdir(parents=True, exist_ok=True)
        with ZipFile(OUTPUT, "w", compression=ZIP_DEFLATED) as archive:
            for name, data in sources:
                archive.writestr(f"fastapi-notes/{name}", data)
    with ZipFile(OUTPUT) as archive:
        assert archive.testzip() is None
        assert set(archive.namelist()) == {f"fastapi-notes/{name}" for name in FILES}, "Unexpected ZIP contents"
        for name, data in sources:
            assert archive.read(f"fastapi-notes/{name}") == data
    print(f"Verified {len(sources)} teaching files: {OUTPUT.name}")


if __name__ == "__main__":
    main()
