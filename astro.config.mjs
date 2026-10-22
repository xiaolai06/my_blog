// @ts-check
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';
import { readBuildEnv, resolveSiteUrl } from './scripts/site-url.mjs';

export default defineConfig({
  site: resolveSiteUrl(readBuildEnv()),
  output: 'static',
  devToolbar: { enabled: false },
  markdown: { shikiConfig: { themes: { light: 'github-light', dark: 'github-dark' } } },
  integrations: [mdx(), sitemap()],
});
