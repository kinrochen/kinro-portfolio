import { copyFile, mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const siteUrl = 'https://kinrochen.top';
const distDir = path.resolve('dist');
const notesDir = path.resolve('src/content/notes');
const defaultImage = `${siteUrl}/og-image.png`;
const today = new Date().toISOString().slice(0, 10);

const defaultSeo = {
  path: '/',
  type: 'website',
  title: 'Kinro Chen | AI 原生创造者与 Vibe Coder',
  description: 'Kinro Chen 的个人作品集，记录 AI 原生产品、Vibe Coding 项目、Obsidian 插件、AI 招聘系统、提示词管理和本地优先 AI 相册实验。',
  image: defaultImage,
};

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function normalizeRoute(routePath) {
  if (routePath === '/') return '/';
  return `/${routePath.replace(/^\/|\/$/g, '')}/`;
}

function absoluteUrl(routePath) {
  return new URL(normalizeRoute(routePath), siteUrl).toString();
}

function parseFrontmatter(source) {
  const match = source.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!match) return {};

  return Object.fromEntries(
    match[1]
      .split('\n')
      .map((line) => line.match(/^([A-Za-z0-9_.-]+):\s*(.*)$/))
      .filter(Boolean)
      .map(([, key, rawValue]) => [key, rawValue.replace(/^["']|["']$/g, '').trim()]),
  );
}

function buildSeoBlock(page) {
  const title = page.title || defaultSeo.title;
  const description = page.description || defaultSeo.description;
  const canonical = absoluteUrl(page.path || '/');
  const image = page.image || defaultImage;
  const type = page.type || 'website';
  const publishedTime =
    page.date && /^\d{4}-\d{2}-\d{2}/.test(page.date) ? `\n    <meta property="article:published_time" content="${escapeHtml(page.date)}" />` : '';
  const schemaType = page.schemaType || (type === 'article' ? 'Article' : page.path === '/' ? 'Person' : 'WebPage');
  const structuredData =
    schemaType === 'Article'
      ? {
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: title,
          url: canonical,
          image,
          description,
          author: {
            '@type': 'Person',
            name: 'Kinro Chen',
            url: siteUrl,
          },
        }
      : {
      '@context': 'https://schema.org',
          '@type': schemaType,
      name: 'Kinro Chen',
      headline: title,
      url: canonical,
      image,
      description,
      sameAs: ['https://github.com/kinrochen'],
        };
  const structuredDataJson = JSON.stringify(
    structuredData,
    null,
    8,
  ).replace(/<\/script/gi, '<\\/script');

  return `<!-- SEO_META_START -->
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}" />
    <meta name="keywords" content="Kinro Chen, Vibe Coding, AI 产品, AI 原生创造者, React, Go, FastAPI, Obsidian 插件, Prompt Engineering" />
    <meta name="author" content="Kinro Chen" />
    <meta name="robots" content="index, follow" />
    <link rel="canonical" href="${escapeHtml(canonical)}" />
    <meta property="og:type" content="${escapeHtml(type)}" />
    <meta property="og:site_name" content="Kinro Chen" />
    <meta property="og:locale" content="zh_CN" />
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:url" content="${escapeHtml(canonical)}" />
    <meta property="og:image" content="${escapeHtml(image)}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="Kinro Chen personal portfolio sharing card" />${publishedTime}
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(title)}" />
    <meta name="twitter:description" content="${escapeHtml(description)}" />
    <meta name="twitter:image" content="${escapeHtml(image)}" />
    <script type="application/ld+json">
${structuredDataJson}
    </script>
    <!-- SEO_META_END -->`;
}

function injectSeo(html, page) {
  return html.replace(/<!-- SEO_META_START -->[\s\S]*?<!-- SEO_META_END -->/, buildSeoBlock(page));
}

async function writeRouteHtml(baseHtml, page) {
  const outputDir = path.join(distDir, page.path === '/' ? '' : page.path.replace(/^\/|\/$/g, ''));
  await mkdir(outputDir, { recursive: true });
  await writeFile(path.join(outputDir, 'index.html'), injectSeo(baseHtml, page));
}

async function getNotePages() {
  const filenames = await readdir(notesDir);
  const noteFiles = filenames.filter((filename) => filename.endsWith('.md') && !filename.startsWith('_'));
  const pages = [];

  for (const filename of noteFiles) {
    const source = await readFile(path.join(notesDir, filename), 'utf8');
    const frontmatter = parseFrontmatter(source);
    const slug = frontmatter.slug || filename.replace(/\.md$/, '');
    pages.push({
      path: `/notes/${slug}/`,
      type: 'article',
      date: frontmatter.date || undefined,
      title: `${frontmatter.title_zh || frontmatter.title_en || slug} | Kinro Chen`,
      description: frontmatter.summary_zh || frontmatter.summary_en || defaultSeo.description,
      image: defaultImage,
    });
  }

  return pages.sort((a, b) => a.path.localeCompare(b.path));
}

function buildSitemap(pages) {
  const urls = pages
    .map(
      (page) => `  <url>
    <loc>${escapeHtml(absoluteUrl(page.path))}</loc>
    <lastmod>${today}</lastmod>
  </url>`,
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
}

const baseHtml = await readFile(path.join(distDir, 'index.html'), 'utf8');
const notePages = await getNotePages();
const pages = [
  defaultSeo,
  {
    path: '/projects/',
    type: 'website',
    title: 'Vibe Coding 项目 | Kinro Chen',
    description: '查看 Kinro Chen 的 AI 原生作品：AI 招聘管理、AI 故事相册、Obsidian 知识捕获、提示词版本管理等真实项目。',
    image: defaultImage,
  },
  {
    path: '/notes/',
    type: 'website',
    title: '笔记 | Kinro Chen',
    description: 'Kinro Chen 的 AI 产品、Vibe Coding、知识管理和开发实践笔记。',
    image: defaultImage,
  },
  ...notePages,
];

for (const page of pages) {
  await writeRouteHtml(baseHtml, page);
}

await copyFile(path.join(distDir, 'index.html'), path.join(distDir, '404.html'));
await writeFile(path.join(distDir, 'sitemap.xml'), buildSitemap(pages));
await writeFile(
  path.join(distDir, 'robots.txt'),
  `User-agent: *
Allow: /

Sitemap: ${siteUrl}/sitemap.xml
`,
);
