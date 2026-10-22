# 博客与 TaskHub 复盘内容核对

核对日期：2026-10-21。只在博客实施文章与样例组件修改；保留原站桌面布局和已有动效。未执行 Git 提交、推送或 TaskHub 后台修复。

## 修改前备份

- 本轮源码与文档快照：`my-blog-before-retrospectives-20261021-183036.zip`，176 个文件，逐项 SHA-256 复核通过；同目录有 manifest。
- 保存位置：`C:/Users/win11/.codex/visualizations/2026/10/21/01a15be0-cccd-7bf2-bf16-b4af1a40066f/backups/`。
- 包含 src、docs、public/examples 与包配置；完整图片、音频等未修改资产仍在先前的全量快照 `my-blog-before-motion-20261021-174600.zip` 中。

## 内容变更

- 旧博客复盘由 `.md` 改为 `.mdx`，公开 slug 保持不变。围绕实际布局、组件、内容、日历、动效与音乐组织；不再以最小新项目教程代替本站复盘。
- 新增 TaskHub 专题，明确真实项目名称与认证入口。正文结合实际代码与官方资料；不把建议视作已实现功能。
- 新增六个独立 HTML 样例：顶部与页脚、卡片重排、月历、播放状态、登录反馈、邮箱诊断。预览与代码同源，使用固定演示数据。
- 未引入依赖；样式仅作用于 `.live-example`，没有调整全局容器、首页网格或侧栏。

## 事实核对入口

博客以本仓库 `SiteLayout.astro`、`Header.astro`、`Footer.astro`、`Calendar.astro`、`DiaryCalendar.astro`、`BlogPost.astro`、内容配置与相关脚本为依据。Motion mini 仅在场景菜单中有导入，不能将全部动效归因于 Motion；播放器装饰条不是真实频谱。

TaskHub 只读来源：`D:/desktop/heikesong`，没有读取 `.env`、数据库或实际用户数据。

| 判断 | 证据 |
| --- | --- |
| 登录入口不是占位 LoginForm | `frontend/src/app/auth-pages/login/page.tsx`；对照 `components/features/auth/LoginForm.tsx` |
| 验证码五分钟，尝试即消费 | `backend/src/utils/captcha-store.ts` |
| 验证码刷新中止旧请求；仅特定错误自动刷新 | `frontend/src/app/auth-pages/login/page.tsx` 的 fetchCaptcha、onSubmit |
| 六位重置码、十分钟、五次阈值、六十秒冷却 | `backend/src/utils/reset-store.ts` |
| 找回邮件读取系统环境变量并缓存 transporter | `backend/src/utils/email.ts`、`backend/src/config.ts` |
| 通知邮件在环境变量基础上读取系统 / 用户设置 | `backend/src/services/notification.service.ts` 的 resolveSmtpConfig |
| 设置页测试调用通知服务 | `backend/src/routes/setting.routes.ts` 的 /email/test |
| 删除 Session 不代表 JWT 已撤销 | `backend/src/services/auth.service.ts` 对照 `middleware/auth.ts`、`utils/jwt.ts` |
| 限频为共享 Map 上的固定窗口，不是注释中的滑动窗口 | `backend/src/middleware/rateLimit.ts` |
| 条件式消息仍不足以消除账号枚举差异 | `backend/src/routes/auth.routes.ts`、`services/auth.service.ts` |

## 资料

正文使用 Astro 官方组件、集合、路由、样式与转场文档；W3C APG 日期选择器；web.dev 动画指南；svg-captcha 官方仓库；Nodemailer SMTP 文档；OWASP 找回密码、会话与 CSRF 指南；Base UI 官方介绍。Maggie Appleton Garden 与 Gwern design 为作者自述的一手设计参考。

## 验证边界

浏览器验证覆盖博客文章、六个模拟预览和文章入口。TaskHub 后台未在本轮运行，没有真实 SMTP 投递或线上认证验收，文章中的后台检查表明确为计划。

### 已完成的浏览器核对

Browser plugin not available；使用独立的 Playwright + 本机 Chrome 无头上下文，没有调整用户正在使用的浏览器窗口。

- 48 项检查通过，脚本错误 0、控制台警告 0。
- 两篇文章分别检查 1920、1366、1024、390px；1536px 检查首屏、代码与交互截图。
- 六个样例的静态端点与显示代码逐字比对，预览初始不请求、展开加载、收起卸载、重新演示恢复初始状态。
- 日历选中、方向键焦点、换月；卡片连续筛选；播放 / 缓冲状态；登录验证码失败与限频；邮件端口、认证失败、模拟投递；代码复制、深色主题与减少动态效果均核对。
- 归档检索可找到新文章，进入后返回保留 type 与关键词。
- 首页容器、导航、卡片、侧栏与页脚的 x / width 对照先前基线，差值小于 1px；底部风景滚入后实际加载完成。
- 过程中修复了沙箱禁止原生表单提交、Astro 7 拦截不透明源图片子请求的问题；保留 `sandbox="allow-scripts"`。
- 最终构建通过：19 个页面、6 个独立样例端点；9 篇公开文章。另有 4 项补充检查通过：禁用脚本的阅读回退、手机登录 Enter 与无真实 API 请求、手机邮箱无溢出、构建样例与源码逐字一致。

截图、临时检查脚本及 JSON 结果保存在本聊天的 visualizations 目录，未加入源码。验证限于 Chrome 与上述尺寸，未进行跨浏览器或 TaskHub 后台运行验收。
