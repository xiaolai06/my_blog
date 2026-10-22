import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, resolve, sep } from 'node:path';
import { projectRoot, readBuildEnv, resolveSiteUrl } from './site-url.mjs';

const root = resolve(projectRoot, 'dist');
const problems = new Set();
let references = 0;
function filesIn(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap(entry =>
    entry.isDirectory() ? filesIn(join(directory, entry.name)) : [join(directory, entry.name)]);
}
const unescape = text => text.replace(/&amp;/g, '&').replace(/&#38;/g, '&');

try {
  const site = new URL(resolveSiteUrl(readBuildEnv('production'), { release: process.argv.includes('--release') }));
  if (!existsSync(join(root, 'index.html'))) throw new Error('缺少 dist/index.html，请先运行 npm run build。');
  const files = filesIn(root);
  const htmlFiles = files.filter(file => file.endsWith('.html'));
  const required = ['404.html', 'about/index.html', 'blog/index.html', 'projects/index.html',
    'projects/orulink/index.html', 'projects/taskhub/index.html', 'projects/clotheshub/index.html',
    'projects/student-score/index.html', 'music/index.html', 'rss.xml', 'sitemap-index.xml', 'sitemap-0.xml'];
  for (const name of required) if (!existsSync(join(root, name))) problems.add(`缺少发布文件：${name}`);

  function checkReference(value, source) {
    const raw = unescape(value.trim());
    if (!raw || raw.startsWith('#') || /^(data:|blob:|mailto:|tel:|javascript:)/i.test(raw)) return;
    const current = '/' + relative(root, source).split(sep).join('/');
    let url;
    try { url = new URL(raw, new URL(current, site)); }
    catch { problems.add(`${relative(root, source)} → 无效地址`); return; }
    if (url.origin !== site.origin) return;
    references++;
    let path;
    try { path = resolve(root, '.' + decodeURIComponent(url.pathname)); }
    catch { problems.add(`${relative(root, source)} → 无效路径`); return; }
    if (path !== root && !path.startsWith(root + sep)) { problems.add(`资源路径越界：${url.pathname}`); return; }
    const candidates = [path, join(path, 'index.html'), path + '.html'];
    if (!candidates.some(candidate => existsSync(candidate) && statSync(candidate).isFile())) {
      problems.add(`${relative(root, source)} → ${url.pathname}`);
    }
  }

  for (const file of htmlFiles) {
    const html = readFileSync(file, 'utf8');
    const markup = html.replace(/<!--[^]*?-->|<script\b[^>]*>[^]*?<\/script>|<style\b[^>]*>[^]*?<\/style>/gi, '');
    for (const match of markup.matchAll(/\s(?:href|src|poster|data-src|data-full)\s*=\s*["']([^"']+)["']/gi)) {
      checkReference(match[1], file);
    }
    for (const match of markup.matchAll(/\ssrcset\s*=\s*["']([^"']+)["']/gi)) {
      if (!match[1].trim().startsWith('data:')) for (const image of match[1].split(',')) checkReference(image.trim().split(/\s+/)[0], file);
    }
    const canonicalTag = [...markup.matchAll(/<link\b[^>]*>/gi)].map(match => match[0]).find(tag => /rel=["']canonical["']/i.test(tag));
    const canonical = canonicalTag?.match(/href=["']([^"']+)["']/i)?.[1];
    if (canonical) {
      if (!canonical.startsWith(site.origin + '/')) problems.add(`${relative(root, file)} 的 canonical 与 SITE_URL 不一致`);
    } else if (!relative(root, file).split(sep).includes('examples')) {
      problems.add(`${relative(root, file)} 缺少 canonical`);
    }
  }
  for (const file of files.filter(file => file.endsWith('.css'))) {
    for (const match of readFileSync(file, 'utf8').matchAll(/url\(\s*["']?([^\s)'";]+)["']?\s*\)/gi)) checkReference(match[1], file);
  }
  for (const name of ['rss.xml', 'sitemap-index.xml', 'sitemap-0.xml']) {
    const file = join(root, name);
    if (!existsSync(file)) continue;
    const xml = readFileSync(file, 'utf8');
    const links = [...xml.matchAll(/<(?:loc|link)>([^<]+)<\/(?:loc|link)>/g)].map(match => match[1]);
    if (!links.length) problems.add(`${name} 缺少站点链接`);
    for (const link of links) {
      if (!link.startsWith(site.origin + '/')) problems.add(`${name} 中的网站地址与 SITE_URL 不一致`);
      checkReference(link, file);
    }
  }
  if (problems.size) throw new Error(`发布检查未通过：\n${[...problems].slice(0, 40).join('\n')}`);
  console.log(`发布检查通过：${htmlFiles.length} 个 HTML，${references} 处站内链接与资源引用；canonical / RSS / sitemap 地址一致。`);
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
