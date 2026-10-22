import { existsSync, readFileSync } from 'node:fs';
import { parseEnv } from 'node:util';
import { fileURLToPath } from 'node:url';

export const projectRoot = fileURLToPath(new URL('../', import.meta.url));

// Match Vite's precedence: mode-specific files win; the shell/CI wins over files.
export function readBuildEnv(mode = process.env.NODE_ENV || 'development') {
  const values = {};
  for (const name of ['.env', '.env.local', `.env.${mode}`, `.env.${mode}.local`]) {
    const file = new URL(`../${name}`, import.meta.url);
    if (existsSync(file)) Object.assign(values, parseEnv(readFileSync(file, 'utf8')));
  }
  return { ...values, ...process.env };
}

export function resolveSiteUrl(env, { release = false } = {}) {
  const value = env.SITE_URL?.trim();
  if (release && !value) throw new Error('正式构建需要 SITE_URL，请配置网站的完整 HTTPS 域名。');
  let url;
  try { url = new URL(value || 'http://localhost:4321'); }
  catch { throw new Error('SITE_URL 必须是完整地址，例如 https://blog.your-domain.com。'); }
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.search || url.hash) {
    throw new Error('SITE_URL 只能包含 HTTP(S) 网站地址，不能包含凭据、查询参数或锚点。');
  }
  // Current navigation and assets use root-relative paths throughout the site.
  if (url.pathname !== '/') throw new Error('本站目前部署在域名根目录，SITE_URL 不能带 /my_blog 等子目录。');
  if (release && (url.protocol !== 'https:' || !url.hostname.includes('.') ||
    /^(localhost|127\.|0\.|\[::1\])/.test(url.hostname) ||
    /(^|\.)(localhost|local|invalid|test|example)$/.test(url.hostname) ||
    /^(www\.)?example\.(com|net|org)$/.test(url.hostname))) {
    throw new Error('正式构建需要真实的 HTTPS 域名，不能使用本地地址或示例域名。');
  }
  return url.href;
}
