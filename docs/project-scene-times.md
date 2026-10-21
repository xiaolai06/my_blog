# 项目四时动景与樱花轮盘

> 2026-10-17 构图更新：全站页脚已移除寄语与落款，正文到页脚统一 20–36px 间距。项目、手记场景按原画 3:1 比例展示，首页仅收去上方无主体的留白天空（3.6:1）；手机底图用 6:5 画框保留右侧树、桥或房子的完整高度。蒙版仅渐隐上沿 18–38px，不再遮住屋顶、桥栏或大面积树冠。顶部去掉放大溢出；电脑端按原画比例，手机将文案与主画面上下分开，首页保留完整全景，项目/手记保留右侧三分之二的构图。各页模块进入视口时采用 280ms、8px 轻淡入，首次可见内容直接显示，系统减少动效时关闭。下文旧固定高度和寄语说明以本更新为准。

项目列表与三篇详情共用樱窗书桌顶部、花溪小桥底部。每个场景有晨曦、晴昼、落日、月夜四段本地循环影片，配套插画保持相同构图。全部六张新增插画均通过内置 imagegen 编辑既有原画生成，没有调用外部视频生成接口。

## 操作与时间

页面只保留可拖动的樱花悬浮按钮。点击后选择「顶部场景」或「底部场景」，再选择「随时间 / 晨曦 / 晴昼 / 落日 / 月夜」。首页顶部沿用落日、月夜两种画面。顶部与底部选择分别保存，跨页面、刷新及同源标签页同步。预览至下个时间边界或十分钟后恢复自动；自动按访问者本机时间在 05:00、09:00、16:00、19:00 切换，属于固定时段，不是地理位置日出日落。

轮盘支持方向键、Home/End、Escape；中间按钮返回上一级，外侧点击收起。拖动樱花可移动，位置按视口比例保存；Alt 加方向键也可移动，菜单提供位置归位。手机会把按钮和轮盘约束在视口内。已移除旧场景栏和可见暂停按钮，系统减少动效、离屏及后台停止播放仍有效。

## 过渡与排版

手动场景 3.2 秒、自动场景 6 秒叠化。下一段解码、对齐 24 秒循环相位后才进入画面，支持反向与连续选择，单层共同蒙版避免透明边缘加深。顶部标题与首页共用 Sakura Display 手写字体，简介共用文楷；项目顶部 54 片独立花瓣，首页 84 片，底部 46 片，手机减少密度。

页脚保持紧凑横幅：桌面 350–450px，手机 380px，不再随整张插画比例拉高。图片等比铺满并靠右下裁切，主要减少天空，保留桥身、树干与溪流；上方渐隐和左侧局部背景帮助寄语融入页面，落款使用主题正文色与轻文字阴影。项目花溪在本地视频微动之外，增加对齐原画水域的细碎反光和扩散涟漪，花瓣独立飘落；离屏、后台和系统减少动效均停止额外动画。导航加大，Logo 与导航分别靠近左右两端，中间留白。项目列表已删除额外说明，详情仍保留主题插画标识。

## 资产

所有影片为 1728 × 576、24 fps、24 秒、576 帧、静音 H.264 / yuv420p，支持 faststart。每段渲染核对 t=0 与 t=24 相同，编码不重复末帧。影片未能播放时保留 WebP。

- 落日：`public/images/projects-studio.webp`、`projects-stream.webp`，影片为 `public/videos/projects-studio-v1.mp4`、`projects-stream-v1.mp4`。
- 新增六组：`public/images/projects-{studio|stream}-{dawn|day|night}-v2.webp`；对应 `public/videos/projects-{studio|stream}-{dawn|day|night}-v2.mp4`。
- 配套 WebP 均为 2172 × 724。枝叶、云与水面的微动由 `scripts/project-scene-shader.mjs` 离线合成，并非外部视频模型输出。
- 原版生成与提示词见 [项目动景](./project-scenes.md)。

重新渲染六个新增时段：`node scripts/render-project-scenes.mjs --variants`。不带参数只渲染原有两段落日。环境路径可用 PLAYWRIGHT_MODULE、CHROME_PATH、FFMPEG_PATH 指定。

## 六张新增插画的完整提示词

输入分别为既有 `public/images/projects-studio.webp` 与 `public/images/projects-stream.webp`，用于保持同一景物和构图。

### studio · dawn

输出：`public/images/projects-studio-dawn-v2.webp`。

> Use case: lighting-weather. Edit target: supplied panoramic cherry window studio with desk illustration. Asset: matching dawn background for a smooth crossfading blog video. Change ONLY time of day and lighting: Pale apricot early dawn with lavender mist, blush pink blossoms and gentle first light. A small diffuse rising sun at the existing sun location. No orange midday glare. CRITICAL preserve EXACT camera, 3:1 panorama, pixel-aligned composition, every branch, all cherry blossom clusters, cloud shapes, mountain silhouettes, window frame and curtain, books, pen holder, notebook, laptop and cup. No objects may move or be redesigned. Preserve same rich detailed painterly anime style. LEFT 45% stays shadowed smoky charcoal-plum even in daylight, clean and low contrast for white website text. Top strip retains enough shade for white navigation. No text, no letters, UI, watermark or borders. Same exact 2172:724 aspect ratio as input.

### studio · day

输出：`public/images/projects-studio-day-v2.webp`。

> Use case: lighting-weather. Edit target: supplied panoramic cherry window studio with desk illustration. Asset: matching day background for a smooth crossfading blog video. Change ONLY time of day and lighting: Soft clear daytime, powder blue sky and ivory clouds, natural pink cherry blossoms, calm blue-green hills, warm soft daylight. Replace the sun disk with diffuse daylight sky. No sunset orange or overly saturated cyan. CRITICAL preserve EXACT camera, 3:1 panorama, pixel-aligned composition, every branch, all cherry blossom clusters, cloud shapes, mountain silhouettes, window frame and curtain, books, pen holder, notebook, laptop and cup. No objects may move or be redesigned. Preserve same rich detailed painterly anime style. LEFT 45% stays shadowed smoky charcoal-plum even in daylight, clean and low contrast for white website text. Top strip retains enough shade for white navigation. No text, no letters, UI, watermark or borders. Same exact 2172:724 aspect ratio as input.

### studio · night

输出：`public/images/projects-studio-night-v2.webp`。

> Use case: lighting-weather. Edit target: supplied panoramic cherry window studio with desk illustration. Asset: matching night background for a smooth crossfading blog video. Change ONLY time of day and lighting: Restrained smoky indigo and dusty mauve moonlight, natural pale pink cherry blossoms with sparse silver edges, a small soft ivory moon at the EXACT existing sun position, just a few faint stars. Readable middle tones, no royal blue, no glowing white blossoms, no oversized moon. A faint warm interior lamp glow on notebook and desk, but do not add a lamp or object. CRITICAL preserve EXACT camera, 3:1 panorama, pixel-aligned composition, every branch, all cherry blossom clusters, cloud shapes, mountain silhouettes, window frame and curtain, books, pen holder, notebook, laptop and cup. No objects may move or be redesigned. Preserve same rich detailed painterly anime style. LEFT 45% stays shadowed smoky charcoal-plum even in daylight, clean and low contrast for white website text. Top strip retains enough shade for white navigation. No text, no letters, UI, watermark or borders. Same exact 2172:724 aspect ratio as input.

### stream · dawn

输出：`public/images/projects-stream-dawn-v2.webp`。

> Use case: lighting-weather. Edit target: supplied panoramic cherry stream and arched footbridge illustration. Asset: matching dawn background for a smooth crossfading blog video. Change ONLY time of day and lighting: Pale apricot early dawn with lavender mist, blush pink blossoms and gentle first light. A small diffuse rising sun at the existing sun location. No orange midday glare. CRITICAL preserve EXACT camera, 3:1 panorama, pixel-aligned composition, every branch, all cherry blossom clusters, cloud shapes, mountain silhouettes, bridge geometry, stream path, rocks and distant valleys. No objects may move or be redesigned. Preserve same rich detailed painterly anime style. Keep broad uncluttered sky and mountains across left, bridge/tree anchored on right. No text, no letters, UI, watermark or borders. Same exact 2172:724 aspect ratio as input.

### stream · day

输出：`public/images/projects-stream-day-v2.webp`。

> Use case: lighting-weather. Edit target: supplied panoramic cherry stream and arched footbridge illustration. Asset: matching day background for a smooth crossfading blog video. Change ONLY time of day and lighting: Soft clear daytime, powder blue sky and ivory clouds, natural pink cherry blossoms, calm blue-green hills, warm soft daylight. Replace the sun disk with diffuse daylight sky. No sunset orange or overly saturated cyan. CRITICAL preserve EXACT camera, 3:1 panorama, pixel-aligned composition, every branch, all cherry blossom clusters, cloud shapes, mountain silhouettes, bridge geometry, stream path, rocks and distant valleys. No objects may move or be redesigned. Preserve same rich detailed painterly anime style. Keep broad uncluttered sky and mountains across left, bridge/tree anchored on right. No text, no letters, UI, watermark or borders. Same exact 2172:724 aspect ratio as input.

### stream · night

输出：`public/images/projects-stream-night-v2.webp`。

> Use case: lighting-weather. Edit target: supplied panoramic cherry stream and arched footbridge illustration. Asset: matching night background for a smooth crossfading blog video. Change ONLY time of day and lighting: Restrained smoky indigo and dusty mauve moonlight, natural pale pink cherry blossoms with sparse silver edges, a small soft ivory moon at the EXACT existing sun position, just a few faint stars. Readable middle tones, no royal blue, no glowing white blossoms, no oversized moon. Subtle silver reflection in the stream. CRITICAL preserve EXACT camera, 3:1 panorama, pixel-aligned composition, every branch, all cherry blossom clusters, cloud shapes, mountain silhouettes, bridge geometry, stream path, rocks and distant valleys. No objects may move or be redesigned. Preserve same rich detailed painterly anime style. Keep broad uncluttered sky and mountains across left, bridge/tree anchored on right. No text, no letters, UI, watermark or borders. Same exact 2172:724 aspect ratio as input.

