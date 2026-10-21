# 素材记录

使用内置 image_gen，不调用项目的模型 API，不需要 API 密钥。

## 最终站点素材
- public/images/sakura-sunset.webp：用户提供的 E:/download/樱花古树下的落日孤影.png，仅转码压缩；网页使用独立动画层，不修改原图。
- public/images/orulink.webp：校园学习与生活连接主题插画。
- public/images/taskhub.webp：任务与独立经营主题插画。
- public/images/clotheshub.webp：服装与面料主题插画。
- public/images/sakura-footer.webp：参考用户页脚截图重新生成的樱花山景，文字由网页原生呈现。
- public/images/journal-life.webp、journal-journey.webp、journal-writing.webp：手记的窗边书桌、暮色小镇与笔记本主题配图。
- public/fonts/：Noto Serif SC 与 Noto Sans SC 官方开源字体的本地WOFF2字集与OFL许可。
- public/favicon.svg 与 Flower.astro 为代码原生花朵图标。

## 三张封面提示词
ORULINK: Elegant editorial cover artwork for ORULINK campus learning and life workspace. Wide landscape 4:3, deep teal and mint luminous connected nodes floating above a serene miniature campus with books and calendar abstractions, refined cinematic 3d paper illustration, subtle grain, ivory and dark cyan, beautiful portfolio project cover. No text, no UI screenshot, no branding letters.

TaskHub: Elegant editorial cover artwork for TaskHub independent business workspace. Wide landscape 4:3, violet and lavender orbital lines connecting a laptop, organized task tiles and a small calendar in abstract isometric space, refined cinematic 3d editorial illustration, pale purple light and dark plum depth, sophisticated not cartoon. No text or letters, no UI screenshot.

ClothHub: Elegant editorial cover artwork for ClothHub fashion operations platform. Wide landscape 4:3, warm beige and muted caramel fashion editorial collage of draped cream jacket, elegant clothing on hangers and fabric texture swatches with tiny abstract order cards, soft studio lighting, polished magazine art direction, subtle paper texture, sophisticated quiet luxury. No people, no text, no UI screenshot.

## 概念提示词摘要
整站概念：1440px 中文个人开发者博客，用户原图作为沉浸式樱花落日首屏，落樱手记 / SAKURA NOTES，首页/项目/手记/关于，主标题把热爱，写成作品，珊瑚色按钮，暖白项目展陈、个人侧栏、日历、手记列表，内容需要原生实现。
内容区概念：1440px 独立可读的下半屏参考，三张项目卡片与1/4侧栏，绿色/紫色/米色封面区分项目，细边框与14px圆角，精细中文宋体标题、暖纸色背景，3篇手记与2026年10月日历。生成图里的技术与产品文案只是占位，实现均用源码核对资料替换。

设计概念的绝对路径见 design.md。项目插画已优化为最大1200px WebP，原始生成文件保留在 Codex generated_images 目录。所有消费素材均已复制到项目中，站点不引用该外部目录。

## 首页优化素材提示词

本轮继续使用内置 image_gen。配图均为插画，不是项目实拍或运行截图。

页脚：参考用户提供的页脚截图。Ultra-wide peaceful anime landscape for a personal blog footer. Pale warm ivory sky with spacious quiet upper area, lavender layered mountains, peach sunset, pink cherry tree at the far right, a small seated girl on a rocky overlook near the lower right, a few petals at the edges. No text, logo or UI; native webpage typography will be placed separately.

生活配图：A tranquil Japanese anime background illustration, a warm wooden desk with closed slim laptop, coffee cup and little plants beside a large open window, outside vivid pink cherry blossoms in golden sunset light, calm thoughtful everyday creative life, refined painterly detail, warm ivory peach and muted pink, cinematic composition. NO people, NO text, NO lettering. Landscape 16:9, image fills entire canvas.

项目复盘配图：A beautiful Japanese anime background illustration of a quiet little hillside town at dusk, glowing shop windows, distant lavender mountains, peach pink sunset clouds, a few framing cherry blossom branches. A sense of beginning a creative journey. Refined painterly detail, coherent lavender coral and navy palette. NO text or lettering. Landscape 16:9, fills canvas.

技术写作配图：A beautiful Japanese anime background illustration close up of an open cream notebook on warm wooden writing desk, elegant dark fountain pen laid diagonally on blank pages, a few fallen cherry petals, soft warm sunset light from the left, blurred coffee cup behind, thoughtful literary atmosphere, muted warm ivory rose coral palette, refined painterly detail. NO text or lettering, blank pages. Landscape 16:9 fills canvas.

字体来源：https://fonts.google.com/noto/specimen/Noto+Serif+SC 与 https://fonts.google.com/noto/specimen/Noto+Sans+SC；许可从 Google Fonts 官方仓库随字体保存。字体更新脚本位于 scripts/update-fonts.mjs。
