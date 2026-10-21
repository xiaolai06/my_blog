---
title: "Python 脚本、工作流与 Coding Agent，到底差在哪"
description: "用同一个仓库修改任务，对照预设程序、固定 LLM 工作流与自主 Agent，解释控制流、工具调用、成本和验收的差异。"
pubDate: 2026-10-20
category: Agent 基础
type: knowledge
summary:
  - Python 是编程语言；Coding Agent 是读取环境并调用工具的系统，两者不在同一层。
  - 关键差异是下一步由谁决定：预设程序，还是模型根据反馈动态选择。
  - 固定规则优先脚本；路径不确定的仓库任务可用 Agent，但仍需预算和验收。
tags: [Coding Agent, Python, 概念辨析]
readingTime: 6
draft: false
cover: /images/journal-journey.webp
resources:
  - title: "Anthropic · Building effective agents"
    url: https://www.anthropic.com/engineering/building-effective-agents
  - title: "SWE-agent · Agent-Computer Interfaces Enable Automated Software Engineering"
    url: https://arxiv.org/abs/2405.15793
  - title: "Aider · 开源 AI pair programming 项目"
    url: https://github.com/Aider-AI/aider
---

## 先把比较放在同一层

“Python 和 Coding Agent 哪个更好”容易把语言与系统混在一起。Python 可以实现脚本、Web 服务，也可以实现 Agent。真正值得比较的是：**普通脚本、固定模型工作流，以及能动态选择动作的编程 Agent。**

Agent 不是某种语言，也不等于调用一次大模型。[Anthropic 对 workflow 与 agent 的区分](https://www.anthropic.com/engineering/building-effective-agents)是本文出发点：前者由预设路径组织步骤，后者让模型根据环境反馈决定行动。下表是据此整理的工程对照。

## 一张表看清控制流

| 维度 | 普通脚本 | 固定 LLM 工作流 | Coding Agent |
| --- | --- | --- | --- |
| 下一步由谁决定 | 开发者预设规则 | 预设步骤，局部模型处理 | 模型结合反馈选择工具与下一步 |
| 输入 | 文件、参数、结构化数据 | 提示、文档、上一步结果 | 目标、仓库上下文、工具观察 |
| 环境反馈 | 按已有逻辑处理 | 进入预定校验或重试分支 | 可据此重新定位、编辑和验证 |
| 常见成本 | 计算与 I/O | 加上固定流程的模型调用 | 随任务、上下文和循环次数波动 |
| 验收方式 | 输出与规则检查 | 分阶段校验与最终检查 | 代码差异、测试与实际行为 |

脚本也能有复杂分支、重试甚至模型调用，“有没有循环”不是标准。Agent 的特征是把一部分行动选择交给模型；实际系统常常混合固定步骤与动态决策。

## 用同一个需求举例

要“把文章的旧站点域名替换成新域名”，文件范围、匹配规则与输出已明确，脚本可以列出匹配、生成差异并校验。引入 Agent 未必有收益，反而增加调用成本。

换成“修复日期筛选跨月时丢失结束日”，起初可能不知道原因来自日期转换、状态提交还是过滤逻辑。Agent 可以搜索关联模块、形成假设、修改实现，再根据失败用例重新定位。

```text
目标 → 读取环境 → 提出下一步 → 调用工具
             ↑                     ↓
             └── 根据结果继续或停止 ──┘
```

这是常见机制的示意，不保证每个 Agent 都按同一方式实现，也不保证一定能完成任务。

## 开源项目让哪些差异更具体

[Aider](https://github.com/Aider-AI/aider)展示了在现有仓库内协作修改代码的工具形态；[SWE-agent 论文](https://arxiv.org/abs/2405.15793)研究模型与开发环境的操作接口。模型之外还需要上下文组织、文件编辑与执行反馈。

同一个模型放进不同工具系统，表现可能不同，不是单凭模型名称就能解释的。这里不使用排行榜数字，因为任务集、版本、预算和成功判定不同，数字通常不能直接横比。

## 什么时候用哪一种

规则明确、反复执行且容易验证的工作，先考虑脚本；步骤稳定但局部需要理解自然语言，可以用固定工作流；需要在未知仓库定位问题、决定下一步时，再评估 Agent。

这不是自动化程度排名。把稳定操作沉淀成脚本，再让 Agent 调用这些确定的工具，往往更容易维护。动态决策应放在真正需要判断的地方。

## 交付仍然需要外部标准

Agent 说“完成”不能当作验收。开始前要明确可改范围、不可触碰的数据、时间或调用上限，以及最终行为；结束时检查差异、运行验证并记录未覆盖环境。

脚本也受环境、并发和外部服务影响，并非绝对确定；Agent 的动态决策增加另一层不确定性。比较时应讨论任务适配、可预测性与验证成本，而不是简单写成“旧编程”和“新编程”。
