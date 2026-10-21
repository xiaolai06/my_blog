# Python note index example

Python 3.12+, standard library only. Extract this folder outside your website's public directory before editing it.

```sh
python --version
python -m unittest -v
python index_notes.py notes --output index.json
python index_notes.py notes --query Python --type learning --output python.json
```

The first index contains two published notes; the filtered index contains one. Drafts are omitted by default. Only `title`, `type` and `draft` are parsed. This is a deliberately restricted frontmatter format, not a general YAML parser. Use a plain title or a JSON double-quoted title, a bare type, and lowercase true/false. A real Astro collection remains responsible for site content validation.

The tool never modifies Markdown. An invalid source aborts the whole build before replacing the previous JSON index. Symlink files and paths resolving outside the input directory are skipped. File replacement uses a temporary file in the same directory; this is not a multi-process locking or crash-durability protocol.
