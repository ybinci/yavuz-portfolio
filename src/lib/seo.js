export const SITE_URL = 'https://ybinci.com'
export const AUTHOR = 'Yavuz Bahadır İnci'

export const pageMetadata = {
  '/': {
    title: `${AUTHOR} | CFD ve Mühendislik Projeleri`,
    description: 'Yavuz Bahadır İnci’nin mühendislik portföyü: CFD, mekanik tasarım, rotor aerodinamiği, yapısal analiz ve araştırma raporları.',
  },
  '/hakkimda': { title: `Hakkımda | ${AUTHOR}`, description: 'Gebze Teknik Üniversitesi makine mühendisliği öğrencisi Yavuz Bahadır İnci’nin eğitim, tasarım, prototipleme ve takım çalışması deneyimleri.' },
  '/projeler': { title: `Mühendislik Projeleri ve CFD Analizleri | ${AUTHOR}`, description: 'CFD ve ANSYS Fluent akış analizleri, rotor kontrol sistemleri, mekanik tasarım ve sonlu elemanlar analizi projelerini inceleyin.' },
  '/proje-gunlugu': { title: `Proje Günlüğü ve Araştırma Raporları | ${AUTHOR}`, description: 'Rüzgâr türbini analizleri, CFD, OpenFAST, URANS ve rotor aerodinamiği üzerine araştırma ve mühendislik proje notları.' },
  '/hizmetler': { title: `Mühendislik Hizmetleri ve Özel Ders | ${AUTHOR}`, description: 'CAD modelleme, mekanik tasarım, ANSYS yapısal analiz, Fluent CFD, teknik raporlama ve lise/üniversite özel ders desteği.' },
  '/iletisim': { title: `İletişim | ${AUTHOR}`, description: 'Mühendislik projeleri, CFD analizleri, teknik danışmanlık ve özel ders için Yavuz Bahadır İnci ile iletişime geçin.' },
}

export function cleanText(value, maxLength = 165) {
  const text = String(value ?? '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
  if (text.length <= maxLength) return text
  const shortened = text.slice(0, maxLength - 1)
  return `${shortened.slice(0, shortened.lastIndexOf(' ') > maxLength / 2 ? shortened.lastIndexOf(' ') : shortened.length)}…`
}

export function normalizePath(path) {
  return path.split(/[?#]/)[0].replace(/\/+$/, '') || '/'
}

export function itemPath(base, item) {
  return `${base}/${encodeURIComponent(item.slug)}`
}

function absoluteImage(image) {
  try {
    const url = new URL(image || '/profile.jpg', SITE_URL)
    return ['http:', 'https:'].includes(url.protocol) ? url.href : `${SITE_URL}/profile.jpg`
  } catch { return `${SITE_URL}/profile.jpg` }
}

export function resolveSeo(pathname, content, isLoading = false) {
  const path = normalizePath(pathname)
  const base = { canonical: `${SITE_URL}${path === '/' ? '/' : path}`, image: `${SITE_URL}/profile.jpg`, type: 'website', robots: 'index, follow, max-image-preview:large', status: 200 }
  if (path === '/admin' || path.startsWith('/admin/')) {
    return { ...base, title: `Admin | ${AUTHOR}`, description: 'Yönetici girişi.', robots: 'noindex, nofollow' }
  }
  if (pageMetadata[path]) return { ...base, ...pageMetadata[path] }

  const match = path.match(/^\/(projeler|proje-gunlugu)\/([^/]+)$/)
  if (match) {
    let slug
    try { slug = decodeURIComponent(match[2]) } catch { slug = '' }
    const isJournal = match[1] === 'proje-gunlugu'
    const key = isJournal ? 'journal' : 'projects'
    const entry = content[key].find((item) => item.slug === slug || (isJournal && String(item.id) === slug))
    if (entry && entry.status !== 'draft') {
      return {
        ...base,
        title: entry.seoTitle || `${entry.title} | ${isJournal ? 'Proje Günlüğü' : 'Mühendislik Projesi'} | ${AUTHOR}`,
        description: cleanText(entry.seoDescription || entry.summary || entry.description || entry.content || `${entry.title}: ${entry.category || entry.projectName || 'mühendislik çalışması'}.`),
        canonical: `${SITE_URL}${itemPath(isJournal ? '/proje-gunlugu' : '/projeler', entry)}`,
        image: absoluteImage(entry.images?.[0]),
        type: isJournal ? 'article' : 'website',
        entry,
        isJournal,
      }
    }
    if (isLoading || !content.available[key]) {
      // A temporary upstream outage is not evidence that an existing URL should
      // be removed from search. The 503 status itself tells crawlers to retry.
      return { ...base, title: `İçerik yüklenemedi | ${AUTHOR}`, description: 'İçerik şu anda yüklenemiyor. Lütfen tekrar deneyin.', robots: 'index, follow', status: 503 }
    }
  }
  return { ...base, title: `Sayfa bulunamadı | ${AUTHOR}`, description: 'İstenen içerik bulunamadı.', robots: 'noindex, follow', status: 404 }
}

export function structuredData(seo) {
  if (seo.status !== 200 || seo.robots.startsWith('noindex')) return null
  if (seo.entry) {
    const entry = seo.entry
    const data = {
      '@context': 'https://schema.org', '@type': seo.isJournal ? 'Article' : 'CreativeWork',
      name: entry.title, headline: entry.title, description: seo.description, url: seo.canonical,
      image: seo.image, inLanguage: 'tr-TR',
      author: { '@type': 'Person', name: AUTHOR, url: `${SITE_URL}/hakkimda` },
    }
    const published = entry.date || entry.createdAt
    if (published && Number.isFinite(Date.parse(published))) data.datePublished = published
    if (entry.updatedAt && Number.isFinite(Date.parse(entry.updatedAt))) data.dateModified = entry.updatedAt
    return data
  }
  return { '@context': 'https://schema.org', '@type': 'WebSite', name: `${AUTHOR} — Mühendislik Portföyü`, url: SITE_URL, inLanguage: 'tr-TR' }
}

export function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character])
}

export function serializeJson(value) {
  return JSON.stringify(value).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029')
}

export function renderSeoHead(seo) {
  const esc = escapeHtml
  const schema = structuredData(seo)
  return `<title data-seo="title">${esc(seo.title)}</title>
<meta data-seo="description" name="description" content="${esc(seo.description)}" />
<meta data-seo="robots" name="robots" content="${esc(seo.robots)}" />
<link data-seo="canonical" rel="canonical" href="${esc(seo.canonical)}" />
<meta data-seo="og:title" property="og:title" content="${esc(seo.title)}" />
<meta data-seo="og:description" property="og:description" content="${esc(seo.description)}" />
<meta data-seo="og:url" property="og:url" content="${esc(seo.canonical)}" />
<meta data-seo="og:image" property="og:image" content="${esc(seo.image)}" />
<meta data-seo="og:type" property="og:type" content="${seo.type}" />
<meta data-seo="og:site_name" property="og:site_name" content="${AUTHOR}" />
<meta data-seo="og:locale" property="og:locale" content="tr_TR" />
<meta data-seo="twitter:card" name="twitter:card" content="summary_large_image" />
<meta data-seo="twitter:title" name="twitter:title" content="${esc(seo.title)}" />
<meta data-seo="twitter:description" name="twitter:description" content="${esc(seo.description)}" />
<meta data-seo="twitter:image" name="twitter:image" content="${esc(seo.image)}" />
${schema ? `<script data-seo="schema" type="application/ld+json">${serializeJson(schema)}</script>` : ''}`
}

export function createSitemap(content) {
  const entries = Object.keys(pageMetadata).map((path) => ({ path }))
  for (const [key, base] of [['projects', '/projeler'], ['journal', '/proje-gunlugu']]) {
    for (const item of content[key]) {
      if (item.status === 'draft' || !item.slug) continue
      entries.push({ path: itemPath(base, item), modified: item.updatedAt || item.date || item.createdAt })
    }
  }
  const seen = new Set()
  const urls = entries.filter((entry) => {
    if (seen.has(entry.path)) return false
    seen.add(entry.path)
    return true
  }).map(({ path, modified }) => {
    const lastmod = modified && Number.isFinite(Date.parse(modified)) ? `<lastmod>${new Date(modified).toISOString()}</lastmod>` : ''
    return `<url><loc>${escapeHtml(`${SITE_URL}${path}`)}</loc>${lastmod}</url>`
  }).join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`
}

export function createSitemapIndex() {
  const children = ['/sitemap-snapshot.xml', '/sitemap-live.xml']
    .map((path) => `<sitemap><loc>${SITE_URL}${path}</loc></sitemap>`).join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${children}\n</sitemapindex>`
}
