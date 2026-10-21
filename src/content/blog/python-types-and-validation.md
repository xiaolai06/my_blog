---
title: "Python 类型提示与数据校验：别把注解当成防线"
description: "从一个任务参数开始，分清类型提示、Pydantic 解析与业务约束，解释字符串数字、额外字段和严格模式的差异。"
pubDate: 2026-10-20
category: Python 实践
type: learning
summary:
  - Python 类型注解主要服务静态工具，不会自动检查运行时传入的数据。
  - 外部输入先校验再进入业务；严格模式和额外字段策略都应显式决定。
  - 结构正确不代表业务允许，权限与跨字段规则需要单独处理。
tags: [Python, 数据校验, 工程实践]
readingTime: 5
draft: false
cover: /images/journal-writing.webp
resources:
  - title: "Python 3.12 · typing：类型提示的职责"
    url: https://docs.python.org/3.12/library/typing.html
  - title: "Pydantic · Strict mode"
    url: https://docs.pydantic.dev/latest/concepts/strict_mode/
  - title: "Pydantic · Model configuration：extra"
    url: https://docs.pydantic.dev/latest/api/config/#pydantic.config.ConfigDict.extra
---

## 注解不会替你拒绝错误输入

下面标注了 `int`，但传入字符串时，Python 不会因为注解而主动拒绝调用：

```python
def double(value: int) -> int:
    return value * 2

print(double("3"))  # 运行时得到字符串 "33"
```

静态检查器可以提示错误；解释器执行的仍是字符串重复运算。[Python 的 typing 文档](https://docs.python.org/3.12/library/typing.html)区分类型注解与运行时强制检查。这解释了为什么“参数都写了类型”仍挡不住异常 JSON。

## 把校验放在输入边界

接口、配置文件、命令行和模型工具参数都属于外部输入。下面用 Pydantic v2 演示一个任务请求，需预先在自己的 Python 环境安装 `pydantic>=2,<3`。这是独立教学示例，本站没有 Python 依赖。

```python
from pydantic import BaseModel, ConfigDict, Field, ValidationError

class TaskInput(BaseModel):
    model_config = ConfigDict(strict=True, extra="forbid")
    title: str = Field(min_length=1, max_length=80)
    priority: int = Field(ge=1, le=3)

payload = {"title": "核对文章出处", "priority": "2"}

try:
    task = TaskInput.model_validate(payload)
except ValidationError as error:
    print(error.errors()[0]["type"])  # int_type
```

上述两个代码块在 Python 3.12.14、Pydantic 2.14.0 中执行，分别得到 `33` 和 `int_type`。把 `"2"` 改成整数 `2` 后成功；添加 `owner` 字段会因为 `extra="forbid"` 被拒绝。显式策略使契约更容易解释。这里是 Python 字典输入，不能直接推广到所有 JSON 类型转换。

## 宽松解析与严格模式怎样选择

[Pydantic 严格模式](https://docs.pydantic.dev/latest/concepts/strict_mode/)限制部分自动转换，但不同类型、不同入口并非完全相同。例如某些日期类型在 JSON 输入时仍接受字符串。应查具体类型的转换规则。

| 策略 | 适合的情境 | 需要接受的代价 |
| --- | --- | --- |
| 允许预期转换 | 表单值天然是字符串，希望统一解析 | 说明哪些转换被允许 |
| strict 模式 | 内部 API，希望遵守类型 | 客户端先统一格式 |
| extra forbid | 拼错字段应立即报错 | 新字段发布需要协调 |
| extra ignore | 有意允许上游携带无关字段 | 拼写错误可能被忽略 |

这是选择建议，不代表一种策略总比另一种安全。表单数字来自文本时，合理解析后校验范围，比机械拒绝全部字符串更符合需求。

## 数据正确还没有回答业务问题

`project_id` 即使是合法整数，也不证明用户有权操作该项目；标题满足长度约束，也可能全是空格。前者需要鉴权和归属检查，后者需要定义空白标准化和空内容规则。

可以分别考虑解析与结构校验、标准化、业务约束、权限检查、持久化。执行顺序应结合安全和领域要求设计，关键是这些职责不能悄悄丢失。

## 给真实接口准备反例

至少考虑缺字段、额外字段、字符串数字、越界数字、空白标题和无权限资源。预期应来自接口契约，而不是“现在的库刚好返回什么”。错误响应应让调用方知道哪个字段需修正，同时避免将敏感值原样写入日志。

类型提示帮助理解代码，运行时校验约束输入，业务规则决定操作能否成立。把三层分别讲清楚，才算真正用好了类型与校验库。
