import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Local WOFF2 subsets keep initial Chinese font downloads below a full CJK font.
const root = fileURLToPath(new URL('../', import.meta.url));
async function collect(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const files = await Promise.all(entries.map(entry => {
    const target = path.join(directory, entry.name);
    return entry.isDirectory() ? collect(target) : /\.(astro|ts|md|mdx|json)$/.test(entry.name) ? [target] : [];
  }));
  return files.flat();
}
const contents = await Promise.all((await collect(path.join(root, 'src'))).map(file => fs.readFile(file, 'utf8')));
const chinese = [...new Set(contents.join('').match(/[\u3000-\u303f\u3400-\u9fff\uff00-\uffef]/g))].sort().join('');
const characters = chinese + 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.,:;!?/()#·—，。；：！「」“”';
const destination = path.join(root, 'public/fonts');
await fs.mkdir(destination, { recursive: true });

async function download(url, options = {}) {
  let lastError;
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      const response = await fetch(url, { ...options, signal: AbortSignal.timeout(30000) });
      if (!response.ok) throw new Error(`Font source returned ${response.status}`);
      return response;
    } catch (error) { lastError = error; }
  }
  throw lastError;
}

const pageCopy = JSON.parse(await fs.readFile(path.join(root, 'src/data/page-copy.json'), 'utf8'));
const footerCharacters = [...new Set((Object.values(pageCopy.footerMessages).flat().join('') + '落樱小筑').replace(/\s/g, ''))].join('');
const heroSource = await fs.readFile(path.join(root, 'src/components/Hero.astro'), 'utf8');
const heroCharacters = [...new Set((heroSource.match(/<h1[\s\S]*?<\/h1>/)?.[0].replace(/<[^>]*>/g, '') + pageCopy.projectHeading + pageCopy.journalHeading).replace(/\s/g, ''))].join('');
const projectHeroSource = await fs.readFile(path.join(root, 'src/components/ProjectHero.astro'), 'utf8');
const projectIntro = projectHeroSource.match(/<p class="project-hero-description">[\s\S]*?<\/p>/)?.[0].replace(/<[^>]*>/g, '') || '';
const journalHeroSource = await fs.readFile(path.join(root, 'src/components/JournalHero.astro'), 'utf8');
const journalIntro = journalHeroSource.match(/<p class="project-hero-description">[\s\S]*?<\/p>/)?.[0].replace(/<[^>]*>/g, '') || '';
const introCharacters = [...new Set((heroSource.match(/<p class="hero-description">[\s\S]*?<\/p>/)?.[0].replace(/<[^>]*>/g, '') + projectIntro + journalIntro + '落樱小筑').replace(/\s/g, ''))].join('');
const fonts = [
  ['Noto Serif SC', 'noto-serif-sc', 'notoserifsc', '400..700', characters],
  ['Noto Sans SC', 'noto-sans-sc', 'notosanssc', '400..700', characters],
  ['Ma Shan Zheng', 'ma-shan-zheng-footer', 'mashanzheng', '400', footerCharacters],
  ['Ma Shan Zheng', 'ma-shan-zheng-hero', 'mashanzheng', '400', heroCharacters],
  ['Ma Shan Zheng', 'ma-shan-zheng-projects', 'mashanzheng', '400', pageCopy.projectHeading],
  ['Ma Shan Zheng', 'ma-shan-zheng-about', 'mashanzheng', '400', pageCopy.aboutHeading],
  ['LXGW WenKai TC', 'lxgw-wenkai-intro', 'lxgwwenkaitc', '400', introCharacters],
];
for (const [family, filename, licenseDirectory, weight, text] of fonts) {
  if (process.argv.includes('--footer-only') && filename !== 'ma-shan-zheng-footer') continue;
  if (process.argv.includes('--hero-only') && filename !== 'ma-shan-zheng-hero') continue;
  if (process.argv.includes('--intro-only') && filename !== 'lxgw-wenkai-intro') continue;
  if (process.argv.includes('--projects-only') && filename !== 'ma-shan-zheng-projects') continue;
  if (process.argv.includes('--about-only') && filename !== 'ma-shan-zheng-about') continue;
  if (process.argv.includes('--body-only') && !filename.startsWith('noto-')) continue;
  const query = new URLSearchParams({ family: `${family}:wght@${weight}`, display: 'swap', text });
  const css = await (await download(`https://fonts.googleapis.com/css2?${query}`, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36' },
  })).text();
  // A single local file must contain the entire requested subset. Do not replace
  // a working font with the first fragment of a multi-file stylesheet.
  const sources = [...new Set([...css.matchAll(/url\((https:[^)]+)\)/g)].map(match => match[1]))];
  if (sources.length > 1) throw new Error(`Font source returned multiple subsets for ${family}; existing local font preserved`);
  const source = sources[0];
  if (!source) throw new Error(`No font file returned for ${family}`);
  const [font, license] = await Promise.all([
    download(source).then(response => response.arrayBuffer()).then(value => Buffer.from(value)),
    download(`https://raw.githubusercontent.com/google/fonts/main/ofl/${licenseDirectory}/OFL.txt`).then(response => response.text()),
  ]);
  if (font.subarray(0, 4).toString() !== 'wOF2') throw new Error(`Expected WOFF2 for ${family}`);
  await fs.writeFile(path.join(destination, `${filename}.woff2`), font);
  await fs.writeFile(path.join(destination, `${filename}-OFL.txt`), license);
  console.log(`${family}: ${font.length} bytes, ${weight} weight, ${text.length} characters`);
}
