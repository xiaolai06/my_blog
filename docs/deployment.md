# GitHub 与服务器发布

当前方案：**GitHub 管理源码和构建，自己的服务器提供静态网页**。代码推送与网站上线是两个步骤。

## 1. 仓库与本地修改

- 仓库：<https://github.com/xiaolai06/my_blog>
- 远程默认分支：`main`。
- 提交源码、内容和网站公开素材；`dist/`、依赖、环境文件和本地调试目录不提交。

后续日常更新，在项目目录查看并提交自己的改动，然后推送到 `main`。如果本地分支仍叫 `master`，可以使用 `git push origin HEAD:main`；不要用强制推送覆盖远程更新。

## 2. 配置正式域名

本站使用根路径链接，应部署在 `https://自己的域名/` 或 `https://blog.自己的域名/`。目前没有实现 `/my_blog/` 这种子目录部署。

本地复制 `.env.example` 为 `.env.production`，例如：

```dotenv
SITE_URL=https://blog.你的正式域名
```

把示例换成真实、解析到服务器的 HTTPS 地址。环境文件不提交；网站不需要其他密钥。终端环境变量优先于文件，生产构建依次加载 `.env`、`.env.local`、`.env.production`、`.env.production.local`，后面的文件优先。

`SITE_URL` 是构建信息：上传后修改服务器环境变量不会改写已有网页，换域名需要重新构建。

## 3. 方式 A：直接下载 GitHub 构建包

1. 打开仓库 **Settings → Secrets and variables → Actions → Variables**。
2. 新增仓库变量 `SITE_URL`，值为正式 HTTPS 地址。这是公开网站信息，不需要保存为 Secret。
3. 打开 **Actions → Build site → Run workflow**，选择 `main` 后运行。也可在运行时填写 `site_url`，只覆盖本次的域名。
4. 等检查全部通过，在该次运行底部 **Artifacts** 下载 `sakura-nook-site`。
5. 下载结果外层是 GitHub 的 ZIP，解开后取得 `site-dist.tar.gz`；再解压得到网站文件。也可用 GitHub CLI 下载：

```powershell
gh run list --repo xiaolai06/my_blog --workflow site.yml
gh run download 运行编号 --repo xiaolai06/my_blog --name sakura-nook-site --dir ./output/release
```

6. 将解出的文件上传至服务器的网站根目录，根目录直接放 `index.html`、`_astro/`、`images/`、`videos/`、`blog/` 等内容。

构建包保留 7 天，过期后重新运行即可。没有配置正式域名时，工作流只使用保留的测试域名检查构建，不上传可发布包。合并请求也不会生成服务器发布包。

## 4. 方式 B：在电脑或服务器构建

安装 Node.js 24，拉取代码后：

```powershell
npm ci
npm run test:release
npm run build:release
```

Linux 也可以不用环境文件，直接传入域名：

```sh
npm ci
SITE_URL=https://你的正式域名 npm run build:release
```

成功后上传 **`dist/` 的内容**。网站不需要运行 `astro dev`、`astro preview`、PM2 或业务项目的后端。若使用面板，在面板设置静态站点并将网站目录指向发布后的文件目录即可。

## 5. 服务器应该如何提供文件

- Caddy / Nginx 的站点根目录指向网站文件目录，目录下直接能找到 `index.html`。
- 为 `/projects/taskhub/` 等目录地址提供其 `index.html`；找不到的页面应返回 404，可使用生成的 `404.html`。
- 不要把所有未知路径都改写到首页，这是多页面静态网站。
- 启用 HTTPS；HTML 建议每次访问重新验证缓存，哈希命名的 `/_astro/` 文件可长期缓存。视频与 WebP 保留正确的内容类型，视频需要正常支持分段请求。
- 更新时把新文件放入独立发布目录，确认完成后再切换网站根目录或 `current` 链接；保留上一版目录便于回退。不要上传一半就删除旧网站。

本仓库尚未配置服务器地址、SSH 账号或自动上传，因此 Actions 只负责生成文件包。

## 6. 发布后确认

1. 首页与四个项目详情可直接打开，刷新深层地址也能访问。
2. 文章正文、代码、示例展开和 ZIP 下载正常。
3. 主题、搜索、模块切换、图片放大与场景控制正常。
4. `/rss.xml`、`/sitemap-index.xml` 和网页源码中的 canonical 使用正式域名。
5. 随便输入一个不存在的路径，服务器返回 HTTP 404。
6. 音乐使用真实网络检查：第三方音源失败与本站静态资源错误分开排查。

本地 `npm run check:site` 只检查构建文件与站内静态引用，不检查公网 DNS、证书、服务器响应和第三方服务。

参考：[Astro 静态部署](https://docs.astro.build/en/guides/deploy/)、[Astro site 配置](https://docs.astro.build/en/reference/configuration-reference/#site)、[GitHub Actions 构建文件](https://docs.github.com/en/actions/how-tos/writing-workflows/choosing-what-your-workflow-does/storing-and-sharing-data-from-a-workflow)。
