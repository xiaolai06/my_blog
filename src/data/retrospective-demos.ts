import shell from '../examples/retrospectives/blog-shell.html?raw';
import cards from '../examples/retrospectives/card-filter.html?raw';
import calendar from '../examples/retrospectives/calendar.html?raw';
import music from '../examples/retrospectives/music-state.html?raw';
import login from '../examples/retrospectives/taskhub-login.html?raw';
import email from '../examples/retrospectives/email-settings.html?raw';
import deployment from '../examples/retrospectives/deployment-check.html?raw';
import certificate from '../examples/retrospectives/certificate-lab.html?raw';
import renewal from '../examples/retrospectives/certificate-renewal.html?raw';

// The preview and displayed code share one source. Examples are maintained files,
// never executable snippets supplied by visitors or arbitrary article HTML.
export const retrospectiveDemos = {
  'blog-shell': {title:'顶部、内容与风景页脚',source:shell,height:490,note:'本站视觉结构的简化样例；图片使用本站资源，导航只在样例内切换。',evidence:'SiteLayout.astro · Header.astro · Hero.astro · Footer.astro'},
  'card-filter': {title:'筛选与卡片位置过渡',source:cards,height:410,note:'三个演示条目，用于观察选中反馈、筛选重排与减少动态效果。',evidence:'selection-motion.ts · content-motion.ts'},
  'calendar': {title:'月历、日期选择与记录提示',source:calendar,height:530,note:'使用固定的演示记录；可换月、选择日期，也可用方向键操作。',evidence:'Calendar.astro · journal-calendar.ts'},
  'music-state': {title:'播放、缓冲与暂停的视觉状态',source:music,height:360,note:'状态演示，不播放音频；展示跳动条何时应该停止。',evidence:'MusicPlayer.astro · music-player.ts'},
  'taskhub-login': {title:'登录表单的反馈层次',source:login,height:650,note:'根据 TaskHub 登录流程制作的教学样例；不连接账号系统，请勿输入真实凭据。',evidence:'auth-pages/login/page.tsx · auth.routes.ts'},
  'email-settings': {title:'邮箱设置与连接状态',source:email,height:570,note:'改进方案的界面样例；按钮只模拟结果，不保存配置或发送邮件。',evidence:'EmailTab.tsx · setting.routes.ts · notification.service.ts'},
  'deployment-check': {title:'部署验收：在哪一层停下来',source:deployment,height:800,note:'选择地址、目录、DNS 或防火墙故障，查看检查结果与下一步命令。只使用固定演示数据。',referenceLabel:'原理依据',evidence:'本站静态构建配置 · Caddy 静态文件与服务文档'},
  'certificate-lab': {title:'HTTP 与 DNS 验证：故障情景练习',source:certificate,height:860,note:'切换验证方式与网络条件，分别观察证书验证和公网入口。离线模拟，不会签发证书或修改 DNS。',referenceLabel:'原理依据',evidence:'Let’s Encrypt challenge types · DuckDNS TXT API · RFC 6598'},
  'certificate-renewal': {title:'续期与过期恢复：证书停在哪一步',source:renewal,height:900,note:'对比磁盘与远端证书，练习识别 Token、计划任务、重载和边缘入口故障。固定数据，不连接真实服务。',referenceLabel:'原理依据',evidence:'Caddy Automatic HTTPS · acme.sh install-cert / cron · OpenSSL x509'},
} as const;
export type RetrospectiveDemoId = keyof typeof retrospectiveDemos;
