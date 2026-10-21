# 四时场景与循环视频

> 更新：旧的可见切换栏和暂停按钮已移除，改为可拖动樱花轮盘。顶部、底部的预览分别保存；项目页新增四时影片。首页花瓣现为 84 片，项目顶部 54 片，底部 46 片。页脚桥树构图与完整交互说明见 [项目四时动景](./project-scene-times.md)。下文早期控制栏、固定项目场景及密度数字仅作为制作过程记录，以此更新为准。

本轮使用内置 imagegen 生成匹配原画的三个页脚时段与一幅首页月夜场景。所有资源已压缩为本地 WebP，浏览时无需生成接口。

## footer-dawn

- 素材：`public/images/footer-dawn.webp`
- 原图：`D:/desktop/my_blog/public/images/sakura-footer.webp`
- 提示词：

> Use case: lighting-weather. Edit this exact ultra-wide landscape footer illustration into quiet early dawn. Preserve the exact 3:1 composition and pixel positions of ALL landmarks: seated dark-haired woman at x80% y72%, cherry tree on right x94%, mountain ridges, valley and foreground rocks. Keep the woman pose, silhouette and hair and tree geometry unchanged. Replace only lighting and sky colors: pale apricot and cool lavender morning mist, delicate rose blossoms, first warm rays at low horizon, layered blue-lilac distant mountains. Top 45% must remain very airy light warm ivory with abundant empty sky so it blends into a cream webpage. Elegant detailed hand-painted Japanese anime landscape, same brushwork as source. No UI, no text, no watermark, no frame, no extra people. Exactly same panoramic aspect ratio, keep all scenery right anchored.

## footer-day

- 素材：`public/images/footer-day.webp`
- 原图：`D:/desktop/my_blog/public/images/sakura-footer.webp`
- 提示词：

> Use case: lighting-weather. Edit this exact ultra-wide landscape footer illustration into soft clear late morning daylight. Preserve the exact 3:1 composition and pixel positions of ALL landmarks: seated dark-haired woman at x80% y72%, cherry tree on right x94%, mountain ridges, valley and foreground rocks. Keep woman pose, silhouette, hair and tree geometry unchanged. Only change atmospheric lighting: powder blue sky merging to very pale warm ivory on top, gentle white wispy clouds, sunlit dusty pink cherry blossoms, sage blue-green mountains with pale lilac distant ridges, shimmering distant river, warm sandstone rocks. Natural subdued colors, readable scene, no harsh cyan, no saturation boost. Top 45% airy nearly ivory empty sky for cream webpage blend. Same finely detailed anime watercolor brushwork as source. No UI/text/watermark/border/extra people. Exactly panoramic 3:1 ratio and same framing.

## footer-night

- 素材：`public/images/footer-night.webp`
- 原图：`D:/desktop/my_blog/public/images/sakura-footer.webp`
- 提示词：

> Use case: lighting-weather. Edit this exact ultra-wide landscape footer illustration into a beautiful moonlit night. Preserve the exact 3:1 composition and exact positions and shapes of ALL landmarks: seated dark-haired woman at x80% y72%, cherry tree at right x94%, mountain ridges, valley, foreground rocks. Woman pose, silhouette, hair and tree geometry remain unchanged. Only lighting and sky change: restrained indigo-lavender moonlight, delicate pale pink blossoms with silver edges, gentle visible moon in sky x65% y34%, sparse tiny stars, distant blue mist and a few tiny warm valley lights, luminous silver river. Not black or crushed dark; painterly readable midtones. Top 40% broad uncluttered desaturated blue-grey gradient for blending into webpage; no text/UI/watermark/frame/extra people. Same detailed anime watercolor illustration, same panoramic 3:1 framing.

## sakura-moonlight

- 素材：`public/images/sakura-moonlight.webp`
- 原图：`D:/desktop/my_blog/public/images/sakura-sunset.webp`
- 提示词：

> Use case: lighting-weather. Edit this exact wide anime landscape into a quiet magical moonlit blue-hour night while preserving the EXACT composition, shapes, contours, camera and every landmark of the source: huge old cherry tree left half, roots, dark-haired seated girl near x75% y84%, sea of clouds, horizon. Do not move or redraw girl, hair, tree or rocks. Replace dramatic orange sunset lighting only with blue-indigo and dusty plum moonlit sky, soft pale pink blossoms catching moonlight, luminous clouds, a bright soft full moon at the SAME position as original sunset disk x89% y78%, tiny sparse stars. Maintain high detail painterly anime style, soft warm little highlights among flowers, readable silhouette and rich atmospheric midtones. No new objects, no text, no UI, no borders, no watermarks. Keep original 1672:941 aspect ratio. Top-left should remain dark enough behind white homepage text. This is a matching alternative of the very same view.

## 月夜第三版（当前使用）

- 素材：`public/images/sakura-moonlight-v3.webp`。使用内置 imagegen 编辑原始落日插画，降低蓝色饱和度和樱花高光，收小月亮，保留画面地标。前一版 `sakura-moonlight.webp` 留作设计归档，不再用于页面。
- 编辑目标：`public/images/sakura-sunset.webp`。
- 完整提示词：

> Edit target: the supplied original cherry-tree sunset artwork. Create a more natural, restrained moonlit variant for the SAME animated website scene. CRITICAL preserve exact pixel geometry, all tree branches, blossom clusters, rocks, cloud outlines and seated woman's silhouette/pose/position, horizon and camera framing. Do not redesign the scenery. Only relight/recolor. Elegant atmospheric anime painting, quiet smoky blue-gray and dusty mauve shadows, subtle muted rose blossoms with sparse silver moonlit edges. NO saturated royal blue, NO uniform white glowing blossoms, NO heavy bright starfield, NO excessive contrast or sharpening. Keep the night readable but substantially calmer and dimmer than the sunset. Replace the sun with a small softly luminous pale ivory moon centered at original sun location x89% y78%, about 1.9% of picture WIDTH in diameter, partially softened by thin cloud; soft small halo, no oversized blazing disk and no white stripe across horizon. Retain faint warm peach haze only just at the horizon. Preserve source painterly brushwork and exact 1672:941 widescreen aspect ratio. No added objects, no text, no UI, no borders. This image must align with the original for a smooth crossfade.

## 播放与时钟（当前版本）

网页直接播放本地 MP4。树冠与枝干使用连续风场共同弯摆，根部稳定，避免只移动花朵造成枝叶脱节；发梢仅轻微飘动，人物躯干和山体保持稳定，云层与日月柔光同时变化。风的主周期为 12 秒，阵风为 8 秒，24 秒回到完全相同的状态。首页最大树冠位移约为原画宽度的 1.3%，底部约为 0.5%，不做整张图片缩放漂移。

首页 05:00–18:59 落日、19:00–04:59 月夜；常规底部 05:00–08:59 晨曦、09:00–15:59 晴昼、16:00–18:59 落日、19:00–04:59 月夜。使用访问者本机 Date 的本地时间，定时器直接预约下个 05/09/16/19 整点边界；另以 15 秒校验发现系统时钟跳变，回到页面时同步。这是固定的本地时间分段，不是地理位置对应的天文日出日落。手动预览在下个时段边界或 10 分钟后恢复随时间；选择与到期时间由 `scene-preference.ts` 统一保存，同源跨页面、刷新和其他标签页继续沿用。首页落日对应底部落日，月夜对应月夜；底部晨曦、晴昼对应首页暖色场景。无法访问本地存储时保留本页选择，跨页面恢复随时间。

项目列表与详情为独立章节，使用固定的樱窗书桌顶部与花溪小桥底部，不显示切换栏，也不参与上述时钟与首页手动场景选择。主题、全局暂停与系统减少动效仍共享。完整素材与制作提示词见 [项目固定动景](./project-scenes.md)。

自动转换采用 6 秒线性叠化，手动采用 3.2 秒，两个方向使用相同逻辑。下一段先完成解码，再对齐当前视频的 24 秒风相位，等待目标帧就绪才淡入。切换中点回原场景时，直接从当前透明度反向播放；再次改变主意也从同一位置继续，不重置画面。底部切入第三个场景时，当前过渡柔和收尾至多 700 毫秒，然后只准备最新目标。两段视频共同使用一层外部渐隐蒙版，避免底部左右边缘、顶部融合区因叠加透明度变深。全局暂停、系统减少动效、隐藏页面与离屏均停止不必要的播放；加载失败保留可见画面或原图，页面运行不依赖 WebGL。

首页控制栏在介绍与主按钮下方合并显示，不覆盖右侧人物；页脚去掉重复 Logo，以左侧短句、署名和控制栏组成一组，右侧为完整人物山景。两处使用通透玻璃材质：外层没有厚阴影或高光渐变，10 像素背景模糊、细透明边框、柔和圆角，选中项只叠加很淡的亮色。首页始终位于插画上，采用透出原画色彩的深色透明薄层与浅色文字；底部浅色模式采用约 14% 白色薄层，暗色为约 16% 深色薄层。两处都保留连续滑动的选中底色和键盘方向键、Home/End 操作。底部四个手动时段使用完整名称；手机控制栏保持单行。暗色底部对全部影片使用统一亮度与冷色薄层，不因场景切换结束而跳变亮度；正文到插画仍共用同一渐隐蒙版。全站滚动条宽 8 像素，轨道随主题融合，去掉两端箭头。

首页不再显示向下探索提示或硬质圆弧边界，最后 145 像素（手机 110 像素）逐渐融入正文背景。首页花瓣 58 片，手机减少四分之一；底部 24 片，均保留暂停和减少动态支持。云层在视频中增加连续流动，网页再叠加低透明度薄雾。花瓣颜色、薄雾和萤光随场景柔和变换。

## 最终视频文件

以下六段均为 H.264 / yuv420p / 24 fps / 24 秒 / 576 帧 / 无声音，支持 faststart。由 `src/scripts/living-scene.ts` 的确定性逐帧渲染输出；每段导出前均校验第 0 秒与第 24 秒画面完全一致。它们是基于原画的代码动态合成，不是外部视频模型生成。

当前 v4 编码每 48 帧设置一个关键帧（每 2 秒），避免整点切换时需要从很早的位置解码。准备下一场景时允许最长 8 秒的单次定位等待，失败会保留当前画面；准备完成才执行淡入，文字和控制栏始终可用。

| 场景 | 文件（位于 public/videos/） | 分辨率 |
| --- | --- | --- |
| 首页落日 | hero-sunset-v4.mp4 | 1600 × 900 |
| 首页月夜 | hero-night-v4.mp4 | 1600 × 900 |
| 底部晨曦 | footer-dawn-v4.mp4 | 1920 × 640 |
| 底部晴昼 | footer-day-v4.mp4 | 1920 × 640 |
| 底部落日 | footer-dusk-v4.mp4 | 1920 × 640 |
| 底部月夜 | footer-night-v4.mp4 | 1920 × 640 |

六段合计约 22 MB，只在需要对应场景时加载。文字、操作按钮与独立花瓣层没有烘焙进视频，仍由网页排版。播放器为 `VideoScene.astro` 与 `video-scene.ts`；本地时钟为 `scene-clock.ts`。旧 `sakura-sunset-loop.mp4` 是上一版 120 秒预览，当前页面不引用。

## 全站主题一致性

参考 shadcn/ui 的 Toggle Group 与语义化主题方式，在现有 Astro 组件上实现，不额外加入 React 运行时。正文、卡片、边框、弱文字、强调色、强调色上的文字、悬停、图片曝光均由根节点主题变量控制；首页不再覆盖一套独立颜色，顶部渐隐与正文、页脚共用背景色。所有文章的代码块使用 github-light / github-dark 双主题，随站点切换。无手动偏好时跟随系统，手动选择后保存，跨页面与同源标签页保持一致。

参考：https://ui.shadcn.com/docs/components/base/toggle-group ，https://ui.shadcn.com/docs/theming 。

## 底部寄语字体

寄语和落款使用 Ma Shan Zheng（马善政）手写体，本地 WOFF2 包含默认寄语与项目寄语共 42 个独立字形，约 18 KB，采用 OFL 开源许可。文案在 `src/data/page-copy.json` 中维护。正文与操作按钮继续使用原有字体。寄语采用两行错落排版与右侧落款，颜色跟随全站主题；手机字号和字距单独适配。

修改寄语后执行 `node scripts/update-fonts.mjs --footer-only` 更新字形子集；完整字体更新命令也会包含它。字体来源：https://github.com/google/fonts/tree/main/ofl/mashanzheng ，许可证位于 `public/fonts/ma-shan-zheng-footer-OFL.txt`。

首页标题为「循着热爱，记录与创造。」，使用同一手写字体的独立首页子集（约 5 KB）。两行略微错落，英文采用简短的 Georgia 斜体。标题字号随屏幕缩放，已检查 320、390、768、1440 像素宽度与落日、月夜场景。标题改字后可执行 `node scripts/update-fonts.mjs --hero-only` 更新子集；普通正文改字使用完整字体更新命令。

首页简介与站点 Logo 中文统一为 LXGW WenKai TC 文楷，采用本地约 10 KB 的独立字形包。简介为「分享项目实践，也记录日常灵感。／在代码与文字之间，留下成长的足迹。」第一行桌面 17px、手机 14–15px，第二行为其 94%，两行间留出 4px。首页 Logo、首页文字、全站底部寄语与场景切换栏共用宽容器：1440px 屏幕左右各留 56px，1920px 屏幕各留 240px，手机仍留 20px。Logo 保留樱花图形，收整图文比例与英文落款间距。修改简介或站名后执行 `node scripts/update-fonts.mjs --intro-only`。字体来源：https://github.com/google/fonts/tree/main/ofl/lxgwwenkaitc ，许可证位于 `public/fonts/lxgw-wenkai-intro-OFL.txt`。
