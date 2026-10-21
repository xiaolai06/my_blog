---
title: "从零写一个 Python 手记索引工具"
description: "从环境准备和三篇示例 Markdown 开始，完成一个可运行的检索工具：解析元数据、过滤草稿、输出 JSON、处理失败，再用八个测试验证行为。"
pubDate: 2026-10-20
category: Python 完整实战
type: learning
summary:
  - 完成一个只依赖标准库的小工具，理解输入、解析、业务规则、输出和验证怎样连接。
  - 提供完整源码、示例数据、运行命令、预期结果与测试，不依赖未给出的占位函数。
  - 先把同步实现与数据契约做好，再判断是否需要异步、第三方解析器或搜索服务。
tags: [Python, 工程实践, 内容工程]
readingTime: 22
draft: false
cover: /images/journal-journey.webp
resources:
  - title: "Python 3.12 · pathlib：路径与文件"
    url: https://docs.python.org/3.12/library/pathlib.html
  - title: "Python 3.12 · argparse：命令行参数"
    url: https://docs.python.org/3.12/library/argparse.html
  - title: "Python 3.12 · unittest：测试框架"
    url: https://docs.python.org/3.12/library/unittest.html
  - title: "Python 3.12 · json：结构化输出"
    url: https://docs.python.org/3.12/library/json.html
  - title: "Python 3.12 · asyncio：进一步学习并发"
    url: https://docs.python.org/3.12/library/asyncio-task.html
---

## 最后要做出什么，先说清楚

学 Python 时很容易分别看懂列表、函数和文件操作，却不知道怎样把它们连成一个能交付的工具。这篇从本站的真实需求出发：**给一个 Markdown 目录建立公开手记索引，并按标题关键词和类型检索。**

完成后，输入是一个文件夹，输出是一份 JSON。草稿不进入结果；中文标题保持可读；输入格式错误时给出明确提示；失败不能悄悄覆盖上一份正确索引。整个例子不访问网络，也不依赖模型服务，先把普通程序的工作方式看清楚。

这不是本站构建链路的替换实现。本站仍用 Astro 内容集合处理文章；下面是独立教学项目，刻意只支持一个很小的 frontmatter 子集。你可以[下载完整示例包](/examples/python-note-index.zip)，包含源码、测试和三篇示例手记；也可以按本文逐步创建。

### 先写验收条件

| 输入或动作 | 应看到的结果 |
| --- | --- |
| 扫描三篇示例，其中一篇是草稿 | 索引包含两篇 |
| 搜索 Python，并限定 learning | 只保留一篇 |
| 搜索不存在的关键词 | 正常输出空数组，而非报错 |
| draft 写成大写 False | 拒绝生成，指出字段问题 |
| 已有索引时遇到错误源文件 | 保留旧索引，退出状态为 2 |

这些条件决定代码怎么拆，也决定测试怎么写。先把“完成”定义好，后面才不会变成只要程序没有崩溃就算成功。

## 准备环境与目录

需要 Python 3.12 或更新版本。先在终端执行：

```sh
python --version
```

如果 Windows 中只有 `py` 可用，把后续的 `python` 统一替换为 `py -3.12`；不要混用两个来源不明的解释器。解压示例包，进入解压出的目录。文件应按下面的方式放在一起：

```text
python-note-index/
  index_notes.py
  test_index_notes.py
  notes/
    agent.md
    hello.md
    draft.md
```

这个项目只用标准库，暂时不需要安装任何包。想与其他项目隔离，可以在这个目录运行 `python -m venv .venv`。Windows 后续直接用 `.venv\Scripts\python` 执行，不需要为了激活脚本调整系统策略；macOS / Linux 对应 `.venv/bin/python`。

先不引入 Web 框架、数据库或异步库。当前目标只是处理一个小目录，把依赖增加到问题真正需要的程度，更有助于理解程序。

## 设计一份足够小的数据契约

在 `notes/hello.md` 中写入：

```md
---
title: "Python 入门：第一个索引工具"
type: learning
draft: false
---
从文件输入到结构化输出。
```

再创建 `agent.md`，标题为“Coding Agent 的工具循环”，类型改为 `knowledge`；创建 `draft.md`，标题为“尚未发布的记录”，类型为 `essay`，`draft` 改成 `true`。示例包已包含这三份文件。

这次只读取三个字段：`title` 是非空文本，`type` 属于四个固定值，`draft` 只允许小写 `true` / `false`，缺失时按草稿处理。最终索引保留标题、类型和相对路径，不保留整篇正文。

一个特别容易踩的坑是 `bool("false")` 的结果为真：非空字符串本身是真值，不能用它解析布尔配置。因此代码会显式比较字符串，再转换为布尔结果。

我们没有实现完整 YAML。示例允许普通标题或使用 JSON 双引号规则的单行标题，不支持单引号、折叠文本、锚点等高级语法。真实内容系统应该交给成熟解析器或 Astro 处理，不能把这个小解析器包装成通用方案。

## 把程序拆成四个可解释的步骤

```text
命令行参数
  → parse_note：读取并校验一篇文章
  → collect：遍历、过滤、组成索引
  → write_index：生成 JSON 并替换输出
  → main：报告结果与退出状态
```

函数边界按照职责划分。解析函数不负责打印成功消息；集合函数不直接写文件；输出函数不重新判断草稿。这样测试某个规则时，不需要先启动整个命令行程序。

`Note` 用 dataclass 表达一条索引记录。它比反复传递三个不具名的字符串更清楚，但并不会自动提供外部输入校验；校验仍然明确发生在 `parse_note` 中。这一点也可以对照[类型提示与运行时校验](/blog/python-types-and-validation/)继续阅读。

### 先理解路径，再理解遍历

[Path](https://docs.python.org/3.12/library/pathlib.html)用对象表达路径。程序把输入目录转换为绝对路径，再把每篇文章保存成相对路径。这样索引不会包含本机用户名或盘符，也不会因为换电脑就失去意义。

遍历结果排序，是为了让相同文件集合得到稳定顺序；这不是按发布时间排序。符号链接文件和解析后超出输入目录的路径被跳过。这只是本地工具的范围约束，并不是可用于运行不可信程序的安全沙箱。

## 完整实现：复制后可以直接运行

将下面内容保存为 `index_notes.py`。这是一份完整文件，不需要另找 `fetch`、`load_model` 等占位函数。

```python
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
```

### 读代码时抓住这几个连接点

`parse_note` 返回 `(Note, bool)`，第二个值明确表示是否草稿。调用者先知道这篇文章是否合法，再决定它是否能公开。即使是草稿，如果元数据损坏也会报告错误；这次选择的是“整个输入目录遵守契约”的策略。

`collect` 处理集合规则。关键词使用 `casefold()` 比较，目的是减少大小写差异；它不提供拼音、分词、纠错或语义检索。标题中没有出现的正文关键词不会命中，这个边界应在界面或文档中说明。

`write_index` 先在目标目录创建临时文件，写完后再替换正式输出。这样不会在 JSON 刚写到一半时直接破坏原文件。临时文件与输出在同一目录，减少跨文件系统替换的问题；这仍不等于多进程锁或断电持久性保证。

`main` 把参数、执行和错误处理接起来。对于参数本身的错误，交给 argparse；对于文件或内容问题，打印到标准错误并返回 2；正常完成返回 0。自动化系统可以使用退出状态判断是否继续下一步，而不必解析一句人类语言的成功消息。

## 第一次运行，核对真实输出

在项目目录执行：

```sh
python index_notes.py notes --output index.json
```

终端应显示：

```text
Indexed 2 note(s) -> index.json
```

打开 `index.json`，应看到下面两条记录。顺序来自文件名排序，因此 `agent.md` 在前；`draft.md` 没有进入索引。

```json
[
  {
    "title": "Coding Agent 的工具循环",
    "type": "knowledge",
    "path": "agent.md"
  },
  {
    "title": "Python 入门：第一个索引工具",
    "type": "learning",
    "path": "hello.md"
  }
]
```

再执行带参数的检索：

```sh
python index_notes.py notes --query Python --type learning --output python.json
```

应只剩 `hello.md` 一条记录。执行 `python index_notes.py --help`，可以查看目录、关键词、类型和输出路径的说明；这是 [argparse](https://docs.python.org/3.12/library/argparse.html)提供的命令行帮助能力。

可以把输入改为实际博客的 Markdown 目录，但必须先确认格式落在本例支持范围内。本工具刻意不支持 MDX，不解析任意 YAML，也没有读取图片或执行正文中的代码。

## 不只看成功路径：把失败也走一遍

先保留刚生成的 `index.json`，把 `draft.md` 中的值改为 `False`，再运行相同命令。终端应指出 `draft must be true or false`，并以状态 2 结束；原索引内容保持不变。修正字段后才能重新生成。

为什么格式错误不直接跳过？因为“索引生成成功但漏了文章”很难察觉。本例选择尽早失败，把错误交给维护者修复。如果产品需要容错导入，可以改成收集错误并单独输出报告，但不能静默漏数据。

另外几种情况也值得亲手试：目录不存在、标题为空、类型拼错、同一个标题字段出现两次、输出文件扩展名不是 `.json`。每种情况对应一种契约，而不是同一个“出错了”提示。

## 用八个测试把行为固定下来

将下面内容保存为 `test_index_notes.py`。测试为自己创建临时目录，不会修改示例数据和真实手记。

```python
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
```

运行：

```sh
python -m unittest -v
```

应看到八个测试通过，最后显示 `OK`。测试覆盖草稿、缺省发布状态、类型与关键词、中文输出、重复字段、错误布尔值，以及失败时保留原文件。它们不逐行模仿实现，而是核对外部可观察的结果。

[unittest](https://docs.python.org/3.12/library/unittest.html)适合在不增加依赖的情况下组织这类检查。这里还使用 `TemporaryDirectory` 隔离文件，使每次运行从同样的条件开始。测试通过不代表处理所有文件系统异常都正确，例如磁盘满、并发写入和极大目录仍需专门验证。

## 为什么这里没有使用 async

这个工具处理少量本地文本。先把路径、契约与输出处理正确，通常比提前并发更有价值。写成 `async def` 也不会让 `Path.read_text()` 自动变成非阻塞操作。

如果以后需要同时请求很多远端资料，可以使用异步 HTTP 客户端，并为每个请求设置超时、给活跃任务设置并发上限。若调用同步 I/O 库，可评估 `asyncio.to_thread`；纯 Python 的 CPU 密集工作则要另看进程或计算服务。

这次没有做吞吐量对比，也不声称同步一定更快。判断是否优化，应先测量总文件数、耗时和内存，确认瓶颈真的来自等待，而不是解析或重复扫描。[asyncio 文档](https://docs.python.org/3.12/library/asyncio-task.html)适合在这一步继续阅读。

## 接进真实网站之前，还缺哪些工作

可以让构建流程运行这个工具，然后由前端读取生成的 JSON；但接入前还应补齐完整元数据解析、稳定文章链接和草稿规则的一致性。当前返回的是源文件相对路径，不应直接把 `hello.md` 当作公开页面地址。

如果公开文章很多，再考虑预生成正文摘要、分词索引或搜索服务；如果只需要本站当前的标题、简介与标签筛选，就保留现有 Astro 实现。练习项目的价值是弄清数据流，不能因为“已经写出来”就替换更成熟的构建能力。

完成这篇后，你应该能自己解释：输入从哪里来，为什么要校验，草稿如何被过滤，输出失败为何不会直接损坏旧文件，测试又在证明哪几条行为。能解释这些，再去增加 Web 接口或 Agent 工具调用，才有稳定的基础。

