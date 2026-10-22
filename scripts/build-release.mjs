import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { projectRoot, readBuildEnv, resolveSiteUrl } from './site-url.mjs';

try {
  const env = readBuildEnv('production');
  env.SITE_URL = resolveSiteUrl(env, { release: true });
  console.log(`正式构建：${env.SITE_URL}`);
  for (const args of [
    [fileURLToPath(new URL('../node_modules/astro/bin/astro.mjs', import.meta.url)), 'build'],
    [fileURLToPath(new URL('./check-site.mjs', import.meta.url)), '--release'],
  ]) {
    const result = spawnSync(process.execPath, args, { cwd: projectRoot, env, stdio: 'inherit' });
    if (result.error) throw result.error;
    if (result.status !== 0) process.exit(result.status || 1);
  }
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
