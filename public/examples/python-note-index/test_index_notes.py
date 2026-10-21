import contextlib
import io
import json
import tempfile
import unittest
from pathlib import Path
from index_notes import collect, main, parse_note

class IndexTests(unittest.TestCase):
    def setUp(self):
        self.folder = tempfile.TemporaryDirectory()
        self.addCleanup(self.folder.cleanup)
        self.root = Path(self.folder.name)

    def note(self, name="a.md", title="Python 入门", kind="learning", draft="false"):
        path = self.root / name
        path.parent.mkdir(parents=True, exist_ok=True)
        quoted = json.dumps(title, ensure_ascii=False)
        path.write_text(f"---\ntitle: {quoted}\ntype: {kind}\ndraft: {draft}\n---\n正文\n", encoding="utf-8")
        return path

    def test_published_and_relative_path(self):
        self.note("nested/a.md")
        self.assertEqual(collect(self.root)[0].path, "nested/a.md")

    def test_drafts_hidden(self):
        self.note(draft="true")
        self.assertEqual(collect(self.root), [])

    def test_missing_draft_is_private(self):
        path = self.note()
        path.write_text(path.read_text(encoding="utf-8").replace("draft: false\n", ""), encoding="utf-8")
        self.assertEqual(collect(self.root), [])

    def test_query_and_type(self):
        self.note("a.md", title="Python 学习")
        self.note("b.md", title="Python 资料", kind="knowledge")
        self.assertEqual(len(collect(self.root, "PYTHON", "learning")), 1)
        self.assertEqual(collect(self.root, "不存在"), [])

    def test_invalid_boolean_rejected(self):
        path = self.note(draft="False")
        with self.assertRaisesRegex(ValueError, "draft must"):
            parse_note(path, self.root)

    def test_duplicate_title_rejected(self):
        path = self.note()
        path.write_text(path.read_text(encoding="utf-8").replace("type:", "title: duplicate\ntype:"), encoding="utf-8")
        with self.assertRaisesRegex(ValueError, "duplicate"):
            parse_note(path, self.root)

    def test_json_contains_chinese(self):
        self.note()
        output = self.root / "result.json"
        with contextlib.redirect_stdout(io.StringIO()):
            self.assertEqual(main([str(self.root), "--output", str(output)]), 0)
        self.assertEqual(json.loads(output.read_text(encoding="utf-8"))[0]["title"], "Python 入门")

    def test_bad_input_keeps_old_output(self):
        self.note(draft="invalid")
        output = self.root / "result.json"
        output.write_text("old", encoding="utf-8")
        with contextlib.redirect_stderr(io.StringIO()):
            self.assertEqual(main([str(self.root), "--output", str(output)]), 2)
        self.assertEqual(output.read_text(encoding="utf-8"), "old")

if __name__ == "__main__":
    unittest.main()
