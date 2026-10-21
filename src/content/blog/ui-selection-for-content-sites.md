---
title: "UI 怎么选型：从本站出发，区分样式、组件与交互"
description: "原生 HTML、Tailwind、Radix 和完整组件库各解决什么问题？用手记卡片与日期弹窗，建立能解释取舍的选型方法。"
pubDate: 2026-10-20
category: UI 选型
type: project
summary:
  - 先看交互复杂度、技术栈和视觉约束，再决定使用哪一层工具。
  - 设计令牌负责一致性，交互组件负责行为，两者不能互相替代。
  - 本站使用 Astro、原生控件与 CSS；Radix 和 Tailwind 是对照方案，并非已接入依赖。
tags: [UI 设计, 架构设计, Astro]
readingTime: 6
draft: false
cover: /images/journal-writing.webp
resources:
  - title: "Radix Primitives · Accessibility"
    url: https://www.radix-ui.com/primitives/docs/overview/accessibility
  - title: "Tailwind CSS · Theme variables"
    url: https://tailwindcss.com/docs/theme
  - title: "Astro · Styles and CSS"
    url: https://docs.astro.build/en/guides/styling/
---

## 先描述界面需要承担什么

这座博客的主要任务是让人找到文章、判断是否值得读，并舒适地读完。卡片和目录需要与风景、字体和亮暗主题保持一致；日期选择还需要键盘操作、焦点管理和取消逻辑。

卡片的难点是信息层级，日期弹窗的难点是交互状态。这两类问题，不适合用同一个“最好看的组件库”解决。

## 几层工具，解决几种问题

下表是面向本站需求的工程判断，并非工具性能排名。

| 方案 | 主要解决什么 | 需要自己承担什么 |
| --- | --- | --- |
| 原生 HTML + CSS | 语义、基础控件、定制排版 | 复杂交互状态与跨场景验证 |
| Tailwind CSS | 用工具类表达样式，组织主题变量 | 组件语义、键盘行为和产品设计 |
| Radix Primitives | React 中的交互原语与常见无障碍行为 | 外观、业务状态、标签与集成验证 |
| 完整组件库 | 标准化表单、表格与工作台控件 | 定制成本、依赖适配和品牌差异 |

[Tailwind 的主题变量](https://tailwindcss.com/docs/theme)连接设计值与工具类；[Radix 的无障碍说明](https://www.radix-ui.com/primitives/docs/overview/accessibility)涉及语义、键盘和焦点。因此 CSS 工具与交互原语不是同层替代品，可以组合，也可以分别采用。

本站当前依赖没有引入 Tailwind 或 React / Radix。这里比较它们，是说明下次需要复杂交互时如何判断，而不是给项目补上一份不存在的技术栈。

## 卡片先定信息，再定装饰

列表里，读者需要依次知道主题、标题、能学到什么，再决定要不要打开。因此标题与简介是主要信息，分类、日期和时间是辅助信息，封面用于识别主题。

如果文字一样大、标签比标题更抢眼，换一套组件库也无法自动解决。应该先统一间距、边框和文字颜色，再检查长标题和窄屏是否成立。

```css
/* 本站已有语义变量的使用方式，值由主题统一提供 */
.note-card {
  color: var(--text);
  background: var(--surface);
  border: 1px solid var(--line);
}
```

这段示意代码的重点是语义角色：组件不需要知道背景究竟是暖白还是深灰。修改变量比逐张卡片改颜色，更容易保持一致。CSS 变量不要求必须使用 Tailwind。

## 把复杂控件的交互成本算进去

日期弹窗不仅是画出月历。还要确定：打开时焦点在哪里，Escape 是否关闭，关闭后回到哪个按钮，草稿是否立即影响结果，屏幕阅读器如何获知日期，手机上是否被底部控件遮挡。

大量复杂控件出现在 React 工作台中时，维护中的交互原语通常有吸引力；在当前 Astro 内容站中，为少量控件引入新运行时，也增加集成与维护工作。选择原生方案的前提是补齐行为并实测，不能只凭“没有依赖”判断质量。

## 用验收条件决定是否保留方案

本站的选型顺序是：先满足正文阅读与键盘访问；再统一主题和信息层级；最后评估复用是否值得额外依赖。验证至少覆盖窄屏长标题、暗色主题、键盘开关弹窗和减少动态效果设置。

如果未来加入大量数据表格、联动表单与菜单，应重新评估组件库。当前保留定制 CSS 的理由，是界面主要工作仍是内容呈现，且现有风格已有变量基础。这个结论适用于当前需求，不是所有博客的通用答案。
