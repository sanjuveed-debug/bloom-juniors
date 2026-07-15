/**
 * Static blog generator — converts content/blog/*.md into crawlable HTML
 * under public/blog/<slug>/index.html plus a /blog/ index page.
 *
 * Runs automatically before `vite build` via the npm "prebuild" script,
 * so Cloudflare Pages regenerates it on every deploy.
 */
import { marked } from 'marked'
import { readdirSync, readFileSync, writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dir = dirname(fileURLToPath(import.meta.url))
const SRC = join(__dir, '..', 'content', 'blog')
const OUT = join(__dir, '..', 'public', 'blog')
const SITE = 'https://bloomjuniors.com'

// ── Tiny frontmatter parser (key: value lines between --- fences) ────────────
function parseFrontmatter(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/)
  if (!match) return { meta: {}, body: raw }
  const meta = {}
  for (const line of match[1].split(/\r?\n/)) {
    const idx = line.indexOf(':')
    if (idx === -1) continue
    const key = line.slice(0, idx).trim()
    let value = line.slice(idx + 1).trim()
    if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1)
    meta[key] = value
  }
  return { meta, body: raw.slice(match[0].length) }
}

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

const CSS = `
  :root{--bg:#FFF8F0;--ink:#422006;--soft:#8A5B2E;--accent:#C2410C;--line:#F0DCC4;--card:#FFFFFF}
  *{box-sizing:border-box}
  body{margin:0;background:var(--bg);color:var(--ink);font-family:'Segoe UI',system-ui,-apple-system,sans-serif;line-height:1.7;font-size:1.05rem}
  header{border-bottom:1.5px solid var(--line);background:rgba(255,248,240,.95)}
  .nav{max-width:760px;margin:0 auto;padding:14px 20px;display:flex;align-items:center;justify-content:space-between}
  .nav a{color:var(--accent);text-decoration:none;font-weight:800}
  .brand{font-size:1.05rem;letter-spacing:.02em}
  main{max-width:720px;margin:0 auto;padding:36px 20px 80px}
  h1{font-size:clamp(1.7rem,4.5vw,2.4rem);line-height:1.2;letter-spacing:-.01em;text-wrap:balance;margin:.3em 0 .4em}
  h2{font-size:1.45rem;margin-top:2em;line-height:1.3;text-wrap:balance}
  h3{font-size:1.15rem;margin-top:1.6em}
  a{color:var(--accent)}
  .meta{color:var(--soft);font-size:.9rem;font-weight:600}
  blockquote{border-left:4px solid var(--accent);margin:1.2em 0;padding:.3em 1em;background:#fff;border-radius:0 10px 10px 0;color:var(--soft)}
  .tablewrap{overflow-x:auto}
  table{border-collapse:collapse;width:100%;margin:1.2em 0;font-size:.95rem;background:var(--card);border-radius:12px;overflow:hidden}
  th,td{padding:10px 14px;text-align:left;border-bottom:1px solid var(--line)}
  th{background:#FDF3E0;font-weight:800}
  hr{border:none;border-top:1.5px solid var(--line);margin:2.4em 0}
  strong{color:var(--ink)}
  li{margin:.35em 0}
  .cta{margin-top:40px;padding:22px 24px;background:var(--card);border:1.5px solid var(--line);border-radius:18px}
  .cta p{margin:.3em 0}
  .cta a{font-weight:800}
  footer{border-top:1.5px solid var(--line);color:var(--soft);font-size:.85rem;text-align:center;padding:24px 20px 40px}
  .postcard{display:block;background:var(--card);border:1.5px solid var(--line);border-radius:18px;padding:20px 22px;margin:16px 0;text-decoration:none;color:var(--ink)}
  .postcard h2{margin:.1em 0 .3em;font-size:1.25rem;color:var(--accent)}
  .postcard p{margin:.2em 0;color:var(--soft);font-size:.95rem}
`

const GA = `
<script async src="https://www.googletagmanager.com/gtag/js?id=G-WW37FRMED7"></script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','G-WW37FRMED7');</script>`

function shell({ title, description, canonical, bodyHtml, jsonLd }) {
  return `<!DOCTYPE html>
<html lang="en-GB">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}"/>
<link rel="canonical" href="${canonical}"/>
<meta name="robots" content="index, follow"/>
<meta property="og:type" content="article"/>
<meta property="og:title" content="${esc(title)}"/>
<meta property="og:description" content="${esc(description)}"/>
<meta property="og:url" content="${canonical}"/>
<meta property="og:site_name" content="Bloom Juniors"/>
<meta property="og:image" content="${SITE}/og-preview.png"/>
<meta name="twitter:card" content="summary_large_image"/>
<link rel="icon" type="image/svg+xml" href="/favicon.svg"/>
<meta name="theme-color" content="#C2410C"/>
${jsonLd ? `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>` : ''}
${GA}
<style>${CSS}</style>
</head>
<body>
<header><div class="nav">
  <a class="brand" href="/">🌻 Bloom Juniors</a>
  <a href="/blog/">Parent Guides</a>
</div></header>
<main>
${bodyHtml}
</main>
<footer>Bloom Juniors — free, ad-free British curriculum learning for ages 3–9 · <a href="/">bloomjuniors.com</a></footer>
</body>
</html>`
}

// ── Build posts ───────────────────────────────────────────────────────────────
marked.setOptions({ gfm: true })
const files = readdirSync(SRC).filter(f => f.endsWith('.md'))
const posts = []

for (const file of files) {
  const raw = readFileSync(join(SRC, file), 'utf8')
  const { meta, body } = parseFrontmatter(raw)
  const slug = meta.slug || file.replace(/\.md$/, '')
  const canonical = `${SITE}/blog/${slug}/`
  let html = marked.parse(body)
  // Wrap tables for horizontal scroll on phones
  html = html.replace(/<table>/g, '<div class="tablewrap"><table>').replace(/<\/table>/g, '</table></div>')

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: meta.title,
    description: meta.description,
    datePublished: meta.date,
    author: { '@type': 'Person', name: meta.author || 'Sanju Veed' },
    publisher: { '@type': 'Organization', name: 'Bloom Juniors', logo: { '@type': 'ImageObject', url: `${SITE}/bj-512.png` } },
    mainEntityOfPage: canonical,
    image: `${SITE}/og-preview.png`,
  }

  const bodyHtml = `
<article>
<p class="meta">${meta.date} · ${meta.readingTime || 5} min read · by ${esc(meta.author || 'Sanju Veed')}</p>
<h1>${esc(meta.title)}</h1>
${html}
<div class="cta">
<p><strong>Bloom Juniors</strong> is a free, completely ad-free British curriculum learning app for ages 3–9 — phonics, early maths and stories, built in Dubai by a parent.</p>
<p><a href="/">Try it free — no download, no signup for kids →</a></p>
</div>
</article>`

  const dir = join(OUT, slug)
  mkdirSync(dir, { recursive: true })
  writeFileSync(join(dir, 'index.html'), shell({ title: `${meta.title} | Bloom Juniors`, description: meta.description, canonical, bodyHtml, jsonLd }))
  posts.push({ slug, ...meta })
  console.log(`  ✓  /blog/${slug}/`)
}

// ── Blog index page ───────────────────────────────────────────────────────────
posts.sort((a, b) => (b.date || '').localeCompare(a.date || ''))
const indexBody = `
<h1>Parent Guides</h1>
<p class="meta">Plain-English guides to phonics, early maths and the British curriculum — written by the Dubai dad behind Bloom Juniors.</p>
${posts.map(p => `
<a class="postcard" href="/blog/${p.slug}/">
  <h2>${esc(p.title)}</h2>
  <p>${esc(p.description)}</p>
  <p><strong>Read guide →</strong></p>
</a>`).join('')}
`
mkdirSync(OUT, { recursive: true })
writeFileSync(join(OUT, 'index.html'), shell({
  title: 'Parent Guides — Phonics, Maths & British Curriculum | Bloom Juniors',
  description: 'Plain-English guides for parents: phonics phases, EYFS milestones, FS1/FS2/KS1 in Dubai, and how to help at home in 10 minutes a day.',
  canonical: `${SITE}/blog/`,
  bodyHtml: indexBody,
  jsonLd: null,
}))
console.log('  ✓  /blog/ (index)')
console.log(`\nDone — ${posts.length} article(s) + index generated into public/blog/\n`)
