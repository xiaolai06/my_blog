# 落樱小筑 · SAKURA NOOK

个人作品集与技术博客。以樱花场景和轻量动效组织首页、项目案例、技术手记与个人介绍，面向电脑端阅读与项目展示。

源码仓库：[xiaolai06/my_blog](https://github.com/xiaolai06/my_blog)。当前采用 **Astro 静态构建 → GitHub 保存源码与自动检查 → 服务器托管网站文件** 的发布方式。

## 当前代码情况

- **网站结构**：首页、项目集合、4 个项目详情、手记归档、关于、音乐空间、404、RSS 和站点地图。
- **项目展示**：ORULINK、TaskHub、ClothHub、学绩；详情包含功能说明、技术栈和开发说明，已有截图的案例支持模块切换与图片放大。项目介绍不依赖业务项目的服务端运行。
- **文章内容**：当前 8 篇公开文章，支持 Markdown / MDX、目录、摘要、分类、标签、日期与关键词筛选、引用来源、代码和独立交互示例。`draft: true` 的内容不输出到文章路由与 RSS。
- **视觉与交互**：深浅主题、随时间变化的场景、花瓣与视频动效、拖动式樱花菜单、站内搜索、页面过渡及减少动态效果适配。
- **音乐空间**：精选音乐、公开电台、开放音频搜索、本地歌曲、收藏、歌词、时钟与专注计时；在线音源依赖第三方网络，本地文件留在访问者浏览器。
- **运行方式**：构建后是 HTML / CSS / JavaScript 和媒体文件，不需要博客数据库、登录服务或 AI Key。文章里的 FastAPI、登录和证书练习是独立教学示例，不是本站线上业务 API。

完整结构与维护边界见 [代码情况说明](docs/code-status.md)，发布步骤见 [GitHub 与服务器发布](docs/deployment.md)。

## 本地开发

推荐 **Node.js 24**（`.nvmrc`），最低版本以 `package.json` 中的 `engines` 为准。使用锁文件安装依赖：

```powershell
npm ci
npx astro dev --background
```

默认访问 `http://localhost:4321/`。后台服务管理：

```powershell
npx astro dev status
npx astro dev logs
npx astro dev stop
```

## 构建与发布检查

普通本地构建允许使用本地地址，便于检查页面：

```powershell
npm run build
npm run check:site
npm run preview
```

正式发布前，复制 `.env.example` 为 `.env.production`，把 `SITE_URL` 换成自己的完整 HTTPS 域名，然后运行：

```powershell
npm run test:release
npm run build:release
```

也可以在终端直接设置 `$env:SITE_URL = "https://你的正式域名"`，终端与 CI 配置优先于环境文件。`.env.production` 不提交到 GitHub。正式构建会拒绝遗漏的地址、本地地址、示例域名和子目录地址，并核对站内链接、资源、canonical、RSS 与 sitemap。

**上传的是 `dist/` 里面的文件**，服务器网站根目录应能直接找到 `index.html`。当前所有导航与资源采用根路径，适合独立域名或子域名；不能直接当作 GitHub Pages 的 `/my_blog/` 子目录站点发布。

GitHub Actions 会在推送 `main` 时安装依赖、检查教学下载包、测试发布配置、构建并检查网站。配置仓库变量 `SITE_URL` 后，会额外提供 `sakura-nook-site` 发布文件包；未配置时只验证构建，不生成可发布包。工作流不会自动连接或修改服务器。

## 内容维护

| 内容 | 主要位置 |
| --- | --- |
| 站名与简介 | `src/consts.ts` |
| 个人介绍与联系方式 | `src/data/profile.ts` |
| 项目列表与基础资料 | `src/data/projects.ts` |
| 项目详细说明 | `src/data/*-case.ts`、`src/components/*Case.astro` |
| 文章 | `src/content/blog/` |
| 文章字段与校验 | `src/content.config.ts` |
| 交互练习 | `src/examples/retrospectives/`、`src/data/retrospective-demos.ts` |
| FastAPI 教学项目与下载包 | `src/examples/fastapi-notes/`、`public/examples/` |
| 页面与通用布局 | `src/pages/`、`src/layouts/`、`src/components/` |
| 交互与样式 | `src/scripts/`、`src/styles/` |
| 网站图片、视频和字体 | `public/` |
| 插画原始素材（不输出到网站） | `artwork/` |

文章写法和模板见 [手记维护说明](docs/journal-authoring.md)。新增大量中文后可运行 `npm run fonts` 更新本地字体字集，该维护命令需要联网；构建不需要下载字体。修改 FastAPI 教学项目后，使用 Python 运行 `scripts/package-learning-examples.py` 重新生成下载包，`--check` 可只核对不重写。

## 素材与运行边界

- 项目主题插画和真实页面截图在展示中分别标注；不把生成插画当作产品截图。
- 字体许可保存在 `public/fonts/`。场景和素材说明见 [素材说明](docs/assets.md)、[动态场景](docs/living-scenes.md)。
- 音乐来源、署名与接入范围见 [音乐来源](docs/music-sources.md)。公开音源的可用性由第三方决定。
- `node_modules/`、`dist/`、`.astro/`、本地环境文件、调试输出、运行数据库与私钥文件不提交。GitHub 上保存源码与网站所需的公开素材。
- 当前优先优化电脑端；手机端已有基础响应式布局，独立的移动端视觉设计仍可后续完善。

开发文档：[Astro](https://docs.astro.build/)、[静态部署](https://docs.astro.build/en/guides/deploy/)。
