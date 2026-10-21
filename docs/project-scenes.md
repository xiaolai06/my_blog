# 项目动景素材

> 当前版本支持四时、独立顶部/底部选择与樱花轮盘。最新交互、构图和六张新增插画的完整提示词见 [项目四时动景](./project-scene-times.md)。下文保留原版两幅落日画面的制作记录；固定时段和可见暂停策略已由新版替代。

项目列表与三篇详情使用同一套固定插画，首页维持原有落日、月夜和四时页脚。配图通过内置 imagegen 生成，参考原图 `public/images/sakura-sunset.webp` 的画风与色调，重新设计内容，没有使用外部视频生成接口。

## 画面与落地

- 顶部：`public/images/projects-studio.webp`，2172 × 724，约 205 KiB。左侧暗色窗帘留给标题，右侧为樱花窗景、书桌与手记。保持窗框、桌面、笔记本与山体稳定，樱枝轻摆、云层缓移、光晕微变。
- 底部：`public/images/projects-stream.webp`，2172 × 724，约 410 KiB。小桥、溪流与花影替代首页的人物山景。桥身与山体稳定，枝叶轻动，溪流有细微波纹。上部用透明蒙版渐隐到页面背景。
- 视频：`public/videos/projects-studio-v1.mp4`（约 3.25 MiB）、`public/videos/projects-stream-v1.mp4`（约 5.61 MiB）。均为 1728 × 576、24 fps、24 秒、576 帧、静音 H.264 / yuv420p，支持快速起播。
- 页面不依赖运行时 WebGL；视频未能播放时保留 WebP。用户全局暂停、系统减少动效、页面隐藏与离屏均停止播放。花瓣是独立页面图层，不烘焙到视频。
- 单一渐隐层将顶部接到 `--bg`；底部单一透明蒙版配合全站主题曝光，浅色与暗色均使用同一组语义变量。没有新增厚玻璃面板或切换栏。

## 本地重新渲染

`scripts/project-scene-shader.mjs` 定义固定镜头下的区域风场与水面变化；`scripts/render-project-scenes.mjs` 在构建前离线生成 MP4。所有周期为 24 秒的整数分频，脚本逐字节核对 t=0 与 t=24 的渲染结果相同后再编码。编码文件不重复末帧，循环间隔保持为一帧。渲染环境需要 Playwright、Chrome 和 FFmpeg；可用 `PLAYWRIGHT_MODULE`、`CHROME_PATH`、`FFMPEG_PATH` 指定现有安装路径。

```sh
node scripts/render-project-scenes.mjs
```

组件入口：`src/components/ProjectHero.astro`、`src/components/Footer.astro`。新版由 `scene-regions.ts` 统一订阅时钟及分区域偏好，两处均可通过樱花轮盘选择。

## 顶部生成提示词

参考图为 `D:/desktop/my_blog/public/images/sakura-sunset.webp`，仅作风格参考。完整提示词：

> Use case: style-transfer. Asset: standalone panoramic background artwork for an existing personal developer blog project archive, NOT a UI screenshot. Input reference D:/desktop/my_blog/public/images/sakura-sunset.webp is STYLE AND PALETTE REFERENCE ONLY. Create completely different content in the SAME richly detailed hand-painted anime landscape style, luminous coral cherry blossoms, smoky indigo and warm apricot sunset. Extremely wide 3:1 panorama. A quiet creator's wooden desk by a broad open studio window, a small open notebook, fountain pen, closed laptop and ceramic cup on the RIGHT half, beyond the window blooming cherry branches, layered distant hills and soft sunset clouds. No people. The LEFT 45% is an elegant shadowed studio wall / curtain, low-detail smoky charcoal-plum, generous clean negative space for white live website heading. Keep all important objects in right half and within central 65% of picture height so it can crop responsively. Top strip gently dark for white navigation. Natural atmospheric light; beautifully restrained coral rather than saturated orange. Fixed camera, no motion blur, no borders, no text, letters, UI, logo or watermark. Fully rendered artwork only; exactly panoramic 3:1 composition.

## 底部生成提示词

使用相同参考图。完整提示词：

> Use case: style-transfer. Asset: standalone panoramic footer background illustration for the same cherry-blossom personal blog, NOT a UI screenshot. Input reference D:/desktop/my_blog/public/images/sakura-sunset.webp is painterly anime STYLE AND COLOR REFERENCE ONLY; new content and framing. Extremely wide 3:1 panorama: a quiet meandering stream beneath cherry blossoms at warm blue-hour dusk, a small weathered arched wooden footbridge at x78%, a delicate cherry tree and branches at right x93%, pale fallen petals floating downstream, layered smoky blue-purple hills far away. NO seated person, NO giant ancient tree, NO studio desk, NO duplicated homepage scene. Right anchored composition. Top 45% and LEFT 60% mostly airy pale warm ivory-lavender sky with subtle mountain haze, enough clean quiet space for a two-line handwritten quote near upper left; the stream, bridge and flowers occupy lower half, rich detailed foreground bottom-right. Soft coral peach sunlight, lavender shadows, nuanced distant mist, same carefully detailed painterly anime brushwork as source. Fixed camera and geometry suitable for subtle water and blossom animation. No text/UI/logo/watermark/frame. Fully rendered scenic artwork, exactly panoramic 3:1 composition.

## 检查

真实 Chrome 检查项目列表、三篇详情、深浅主题与手机裁切；确认实际视频解码播放、暂停/恢复、离屏停止与减少动效。插画是项目页装饰背景，项目卡片封面继续明确说明为主题插画，不作为项目运行效果证明。
