---
title: "从零搭建这座手记站：内容架构、页面生成与 UI 取舍"
description: "沿着一篇 Markdown 变成可阅读页面的全过程，讲清需求拆分、内容契约、静态路由、交互状态、视觉规范和发布检查。"
pubDate: 2026-10-20
category: 项目完整复盘
type: project
summary:
  - 先确定内容与阅读任务，再把文章数据、页面呈现和浏览器交互分开设计。
  - 用一套最小 Astro 示例走通内容校验、列表、详情和样式，再理解本站增加了哪些能力。
  - UI 选型同时考虑阅读体验、交互复杂度和维护成本；发布规则需要覆盖每一个公开出口。
tags: [Astro, 架构设计, UI 设计, 内容工程]
readingTime: 19
draft: false
cover: /images/journal-journey.webp
coverCaption: 本站内容架构的主题插画，非运行截图
resources:
  - title: "Astro · Content collections"
    url: https://docs.astro.build/en/guides/content-collections/
  - title: "Astro · Routing"
    url: https://docs.astro.build/en/guides/routing/
  - title: "Astro · Components"
    url: https://docs.astro.build/en/basics/astro-components/
  - title: "Astro · Styling"
    url: https://docs.astro.build/en/guides/styling/
  - title: "Astro · Islands architecture"
    url: https://docs.astro.build/en/concepts/islands/
---

## 先把网站要解决的事写出来

一个博客项目很容易从挑框架、找组件开始，结果是首页做得很热闹，真正写文章时却发现分类混乱、正文难读、改一次标题要找三个地方。本篇把顺序倒过来：先说明读者要完成什么，再走一遍最小实现，最后解释本站为何采用现在的结构。

本站有两个主要任务：第一次来的读者，要知道这里记录什么、从哪里开始；带着问题回来的读者，要按类型、关键词、日期或主题找到一篇文章，并在长文中定位到具体章节。前者需要明确的介绍和摘要，后者需要稳定的链接、目录与检索。

因此，第一版的验收可以写成四句话：新增一篇 Markdown 后，不手工添加列表链接也能找到它；未发布的文章不会出现在公开输出；一篇长文在手机上可连续阅读；从筛选结果进入文章后，可以回到原来的筛选位置。风景和插画服务于气质，不能替代这些任务。

### 明确这一版的边界

这是一座公开、以阅读为主的个人内容站。当前没有在线协作编辑、私人笔记权限或用户账号。文章保存在仓库，修改后重新构建发布。这样的约束使构建时生成 HTML 成为合理起点，但并不意味着以后不能增加服务端能力。

| 需求 | 当前方案 | 什么时候重新考虑 |
| --- | --- | --- |
| 写作与版本记录 | Markdown 与 Git | 编辑者需要在线协作时 |
| 公开文章访问 | 构建时生成页面 | 页面依赖每次请求的私有数据时 |
| 少量内容检索 | 浏览器筛选元数据 | 内容规模或全文检索需求变化时 |
| 阅读偏好 | 本地记忆字号、主题 | 需要跨设备账户同步时 |

这是根据本站需求作出的选择，不是所有内容产品的通用答案。

## 画出内容到页面的完整路径

不要把“文章”和“文章页面”当成同一份东西。文章是数据，页面是数据的一种呈现方式。本站的路径如下：

```text
作者编辑 Markdown
  ↓
content.config.ts 加载文件、校验字段
  ↓
查询已发布文章
  ├─ /blog/：摘要、类型、标签与分页
  ├─ /blog/文章标识/：正文、目录、来源
  ├─ 首页：最近记录
  └─ /rss.xml：订阅输出
  ↓
浏览器按需增强搜索、日期筛选、代码复制和阅读偏好
```

这样拆开后，标题只有一个来源，文章可以被多个页面消费。列表卡片不需要知道正文如何排版；正文也不用知道读者从第几页进入。修改视觉层不应要求批量修改 Markdown。

本站的主要职责落在以下位置。它们描述的是当前项目，不是下面最小教程必须拥有的文件数量。

| 文件或目录 | 负责什么 |
| --- | --- |
| `src/content/blog/` | 正文和文章元数据 |
| `src/content.config.ts` | 内容字段的格式与默认值 |
| `src/data/journal.ts` | 类型名称、主题颜色等公共规则 |
| `src/components/JournalEntry.astro` | 列表的一篇记录 |
| `src/pages/blog/index.astro` | 归档页面的结构和初始数据 |
| `src/pages/blog/[...slug].astro` | 为已发布文章生成详情路径 |
| `src/layouts/BlogPost.astro` | 统一的长文阅读结构 |
| `src/scripts/journal-archive.ts` | 筛选、分页、URL 和日历状态 |

判断拆分是否有用，可以看一个问题：当新增类型时，需要修改的是一处公共规则，还是在几个页面里寻找重复的判断？文件多并不自动代表结构好，减少规则的重复维护才有意义。

## 第一步：建立最小项目和内容契约

下面单独做一个可理解的最小版本，方便从零复现。它不包含本站的风景、阅读工具栏和日期弹窗。示例采用 Astro 当前的内容加载方式；现有本站无需再次初始化。

在一个新的空目录中创建 Astro 项目，选择最小模板并安装依赖：

```sh
npm create astro@latest
```

进入创建出的项目后，确认 `package.json` 中有开发与构建脚本。基础内容只需要这几个文件：

```text
src/
  content.config.ts
  content/blog/hello.md
  pages/blog/index.astro
  pages/blog/[...slug].astro
  styles/notes.css
```

在 `src/content.config.ts` 定义文章的公共结构：

```ts
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const blog = defineCollection({
  loader: glob({ base: './src/content/blog', pattern: '**/*.md' }),
  schema: z.object({
    title: z.string().min(1),
    description: z.string(),
    pubDate: z.coerce.date(),
    type: z.enum(['project', 'learning', 'knowledge', 'essay']),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(true),
  }),
});

export const collections = { blog };
```

[内容集合](https://docs.astro.build/en/guides/content-collections/)让加载和结构检查有明确入口。这里最值得注意的并不是 API 名字，而是默认行为：没有写 `draft` 的文章仍是草稿；类型只能取约定值；日期转成统一的数据类型。错误尽量在发布前暴露。

Schema 只能约束格式。一个标题可以类型正确却没有信息量，一段技术结论也可能格式正确却完全错误。编辑审阅与数据校验必须分别完成。

接着创建 `src/content/blog/hello.md`：

```md
---
title: "第一篇：把内容与页面分开"
description: "用一个最小例子理解文章如何进入列表和详情页。"
pubDate: 2026-10-20
type: learning
tags: [Astro, 内容工程]
draft: false
---

## 这次解决什么

新增一篇文章后，让列表与详情自动生成。

## 怎样确认完成

打开列表，进入文章，再把 draft 改成 true 检查发布边界。
```

这个文件同时提供卡片摘要和正文，但不写卡片 HTML。`hello` 是此例的文章标识；一旦公开链接被使用，随意改文件名可能造成旧地址失效，需要迁移或重定向方案。

## 第二步：让列表和详情真正连起来

在 `src/pages/blog/index.astro` 查询内容并输出普通链接：

```astro
---
import { getCollection } from 'astro:content';
import '../../styles/notes.css';
const posts = (await getCollection('blog', ({ data }) => !data.draft))
  .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
---
<html lang="zh-CN">
  <head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width" /><title>手记</title></head>
  <body>
    <main>
      <h1>手记</h1>
      <p>记录问题、实现过程与可复用的方法。</p>
      <ul class="note-list">
        {posts.map(post => (
          <li><a href={`/blog/${post.id}/`}>
            <h2>{post.data.title}</h2>
            <p>{post.data.description}</p>
          </a></li>
        ))}
      </ul>
    </main>
  </body>
</html>
```

接着在 `src/pages/blog/[...slug].astro` 生成详情页：

```astro
---
import { getCollection, render } from 'astro:content';
import type { CollectionEntry } from 'astro:content';
import '../../styles/notes.css';

export async function getStaticPaths() {
  const posts = await getCollection('blog', ({ data }) => !data.draft);
  return posts.map(post => ({ params: { slug: post.id }, props: { post } }));
}

type Props = { post: CollectionEntry<'blog'> };
const { post } = Astro.props;
const { Content } = await render(post);
---
<html lang="zh-CN">
  <head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width" /><title>{post.data.title}</title></head>
  <body>
    <main>
      <a href="/blog/">返回手记</a>
      <article><h1>{post.data.title}</h1><p>{post.data.description}</p><Content /></article>
    </main>
  </body>
</html>
```

[静态路由](https://docs.astro.build/en/guides/routing/)中的 `getStaticPaths` 决定哪些地址会生成，`render` 把内容交给页面。这里两个出口都过滤草稿。如果只有列表过滤，直接输入详情地址仍可能访问到未发布内容。

对于新手，常见误区是把 `<Content />` 当作浏览器请求数据库。此例中它参与构建页面；部署后读者获取生成的 HTML。数据来源、构建时间与请求时间是理解这套设计的三个关键概念。

## 第三步：先完成可读的 UI，再添加装饰

在 `src/styles/notes.css` 放入最小样式：

```css
:root { color-scheme: light; font-family: system-ui, sans-serif; }
* { box-sizing: border-box; }
body { margin: 0; background: #f8f6f2; color: #243044; }
main { width: min(100% - 40px, 820px); margin: 48px auto; }
a { color: #905266; }
a:focus-visible { outline: 3px solid #905266; outline-offset: 5px; }
p, li { line-height: 1.9; }
h1 { font-size: clamp(26px, 5vw, 38px); line-height: 1.5; }
h2 { line-height: 1.6; }
.note-list { list-style: none; padding: 0; display: grid; gap: 18px; }
.note-list a { display: block; padding: 22px; border: 1px solid #e5ded7;
  border-radius: 20px; background: #fffdfb; text-decoration: none; }
.note-list h2 { margin: 0 0 10px; font-size: 21px; }
.note-list p { margin: 0; color: #596574; }
pre { padding: 18px; border-radius: 12px; overflow-x: auto; }
img { max-width: 100%; height: auto; }
```

先确认标题层级、正文宽度、行距、对比度、键盘焦点和窄屏换行，再加入封面、图标与动效。UI 选型也按这个顺序判断：页面大部分是文章时，Astro 模板与 CSS 已经能完成主要工作；若出现复杂表单、数据表格或拖拽编辑器，再按交互区域评估组件框架。

本站没有为了几个按钮引入 React 运行时。这个选择减少一种需要维护的运行机制，但并不能直接推出页面一定很轻：风景图片、字体和视觉效果也会带来成本。性能必须在实际页面中观察。

### 为什么没有直接套一整套组件库

一整套组件库的优势是统一复杂控件的行为，但会带来样式和结构约束。对于这个博客，统一的间距、颜色和圆角规则比大量现成控件更紧迫。本站保留自己的暖色背景、主题插画与风景，同时让列表和长文使用更稳定的阅读层级。

具体到归档页：卡片约 20px 圆角，图像约 12px，内部按钮更收敛；颜色表达类型和状态，不把每个标签都做成强视觉入口；手机先显示文章，日历和主题放在后面。圆角本身没有“专业”的固定数值，关键是相同层级保持一致，并留够文字空间。

## 第四步：把筛选和分页当成一条状态链

最小版本走通后，本站增加搜索、类型、日期和分页。此时最容易出错的地方是：每个控件各自记状态，导致列表、页码与 URL 显示不同结果。

本站把这些条件放在一个状态中，按固定顺序计算：

```text
全部已发布记录
  → 类型、关键词、日期过滤
  → 排序
  → 计算匹配总数与总页数
  → 将页码限制在有效范围
  → 截取当前页的 3 篇
  → 同步计数、按钮与 URL
```

**先筛选、再分页**是必要条件。否则在第二页搜索一个只存在于第一页的标题，会错误地显示没有结果。修改筛选条件回到第一页；刷新 `?page=2` 恢复第二页；从文章返回时保留进入前的条件。日历统计依据所有符合分类与关键词的记录，而非屏幕上恰好出现的三篇。

URL 保存可分享的状态，本地存储保存个人偏好。这两个用途应分开：字号不必污染分享链接，页码也不能只记在某台设备里。不要把同一项条件分别保存在四个彼此不同步的变量中。

当前客户端分页仍随 HTML 加载全部卡片，只在界面显示三篇。因此它改善浏览长度，不等同于网络层按页加载。内容增长后，可以根据实际开销改成构建时分页或独立索引；这里没有用八篇内容推断大规模性能。

## 第五步：从能运行走到能发布

在新项目中启动开发服务，打开 `/blog/`，应看到第一篇文章；点击进入详情，再执行构建检查：

```sh
npx astro dev --background
npm run build
```

停止服务可用 `npx astro dev stop`。对现有本站，沿用项目规定的后台模式，不额外启动一份前台服务。

接着做一次“草稿实验”：把 `hello.md` 的 `draft` 改为 `true`，重新构建，确认文章不在列表和详情输出。本站还需要检查首页、RSS 与任何预生成搜索数据。公开规则覆盖的是输出集合，隐藏卡片只是其中一个表现。

| 检查层次 | 具体动作 | 发现什么 |
| --- | --- | --- |
| 内容 | 故意填错 type，再构建 | Schema 是否真的拦住错误 |
| 发布 | 草稿与已发布状态切换 | 是否有遗漏的公开出口 |
| 导航 | 列表 → 详情 → 返回 | 链接和状态能否衔接 |
| 阅读 | 手机打开代码、表格与目录 | 有没有整页横向溢出 |
| 交互 | 第二页搜索、清除、刷新 | 页码和筛选是否同步 |
| 无脚本 | 关闭 JavaScript 阅读文章 | 基本内容与链接是否仍可用 |

截图适合检查某个尺寸的视觉结果，构建适合检查生成链路，实际点击适合检查交互状态。它们各自回答不同问题。把“构建成功”写成“所有功能已经正确”会掩盖验证边界。

## 这套设计带走什么，下一步又是什么

这次最值得复用的不是文件名，而是三个边界：内容规则集中定义，呈现组件消费数据，交互围绕清楚的状态更新。它们使文章越来越长、页面越来越多时，规则仍能被找到和验证。

如果接下来增加全文搜索，先定义索引包含标题还是正文、是否排除草稿、什么时候更新；如果增加账号，先明确哪些数据因用户身份改变，再决定服务端结构。每项新技术都应该对应一个当前方案无法很好解决的问题。

继续阅读 [UI 选型的专题笔记](/blog/ui-selection-for-content-sites/)，可以进一步比较自定义 CSS、工具类和无样式组件的职责；想理解数据进入页面前如何校验，可以动手完成 [Python 手记索引实战](/blog/python-asyncio-task-boundaries/)。两篇补充都建立在本文的内容边界之上。

