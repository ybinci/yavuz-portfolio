import assert from 'node:assert/strict'
import { copyFile, mkdir, mkdtemp, readFile, rm } from 'node:fs/promises'
import { createServer } from 'node:http'
import { once } from 'node:events'
import { basename, dirname, join, resolve } from 'node:path'
import { tmpdir } from 'node:os'
import { pathToFileURL } from 'node:url'
import test from 'node:test'
import { loadPublicContent, getStaticContent, mergePublished, normalizeProject } from '../src/lib/publicContent.js'
import { createSitemap, createSitemapIndex, resolveSeo, renderSeoHead, serializeJson, pageMetadata } from '../src/lib/seo.js'
import { verifySitemapDeployment } from '../scripts/verify-sitemap.mjs'
import { renderPage } from '../dist-ssr/entry-server.js'
import renderHandler, { createRenderHandler } from '../api/render.js'
import sitemapHandler, { createSitemapHandler } from '../api/sitemap.js'

const publicUrl = 'https://example.supabase.co'
const pdfUrl = `${publicUrl}/storage/v1/object/public/project-files/urans.pdf`
const project = {
  id: 'new-project', slug: 'rotor-aerodinamigi', title: 'Rotor Aerodinamiği ve CFD',
  summary: 'Rüzgâr türbini rotorunun CFD analizi.', description: 'Rotorun hız ve basınç dağılımları.',
  role: 'Analiz', images: ['/projects/fluent/fluent-1.jpg'], tools: ['CFD'],
  status: 'published', created_at: '2026-10-23T12:00:00Z',
}
const journal = {
  id: 'journal-1', slug: 'urans-openfast', title: 'URANS ve OpenFAST Araştırma Notları',
  summary: 'Rüzgâr türbini analizi için URANS ve OpenFAST yöntemleri.',
  content: 'Bu metin JavaScript çalıştırılmadan ilk HTML yanıtında bulunmalı.',
  images: ['/projects/dual-rotor/dual-rotor-1.jpg'], pdf_url: pdfUrl,
  related_project_slug: 'cift-rotorlu-dengeleme-sistemi',
  status: 'published', date: '2026-10-23', tags: ['URANS', 'OpenFAST'],
}

function mockDatabase({ fail = false } = {}) {
  return async (input, options) => {
    const url = new URL(input)
    assert.equal(url.origin, publicUrl)
    assert.equal(url.searchParams.get('status'), 'eq.published')
    assert.equal(options.headers.apikey, 'test-public-key')
    assert.equal(options.headers.Authorization, 'Bearer test-public-key')
    if (fail) throw new TypeError('Failed to fetch')
    // Include a draft to also check our defensive filtering beyond the REST query.
    const data = url.pathname.endsWith('/projects')
      ? [project, { ...project, slug: 'unpublished-project', title: 'PRIVATE-PROJECT', status: 'draft' }]
      : [journal, { ...journal, slug: 'unpublished-note', content: 'PRIVATE-DRAFT', status: 'draft' }]
    return { ok: true, json: async () => data }
  }
}

async function fixtureContent() {
  return loadPublicContent({ url: publicUrl, anonKey: 'test-public-key', fetchImpl: mockDatabase() })
}

test('published remote content precedes static projects; only matching slugs are replaced', async () => {
  const content = await fixtureContent()
  const original = getStaticContent()
  assert.equal(content.projects[0].slug, project.slug)
  assert.equal(content.projects.length, original.projects.length + 1)
  assert.deepEqual(content.projects.slice(1).map((item) => item.slug), original.projects.map((item) => item.slug))
  assert.equal(content.journal.length, 1)
  const duplicate = { ...project, slug: original.projects[0].slug }
  const merged = mergePublished(original.projects, [project, duplicate], normalizeProject)
  assert.equal(merged.length, original.projects.length + 1)
  assert.equal(merged.filter((item) => item.slug === duplicate.slug).length, 1)
  assert.equal(merged.find((item) => item.slug === duplicate.slug).title, duplicate.title)
})

test('failure or missing env keeps all static projects', async () => {
  const original = getStaticContent()
  const failed = await loadPublicContent({ url: publicUrl, anonKey: 'test-public-key', fetchImpl: mockDatabase({ fail: true }) })
  assert.deepEqual(failed, original)
  assert.deepEqual(await loadPublicContent(), original)
})

test('public queries paginate instead of silently stopping at Supabase row limit', async () => {
  const calls = []
  const content = await loadPublicContent({ url: publicUrl, anonKey: 'test-public-key', fetchImpl: async (input) => {
    const url = new URL(input)
    calls.push(url.pathname + ':' + url.searchParams.get('offset'))
    const data = url.pathname.endsWith('/projects') && url.searchParams.get('offset') === '0'
      ? Array.from({ length: 1000 }, (_, index) => ({ ...project, id: String(index), slug: `project-${index}` }))
      : []
    return { ok: true, json: async () => data }
  } })
  assert.ok(calls.includes('/rest/v1/projects:1000'))
  assert.equal(content.projects.length, getStaticContent().projects.length + 1000)
})

test('all project/journal titles and descriptions are unique; canonicals omit queries and fragments', async () => {
  const content = await fixtureContent()
  const paths = [
    ...Object.keys(pageMetadata),
    ...content.projects.map((item) => `/projeler/${item.slug}`),
    ...content.journal.map((item) => `/proje-gunlugu/${item.slug}`),
  ]
  const tags = paths.map((path) => resolveSeo(`${path}?utm_source=test#top`, content))
  assert.equal(new Set(tags.map((tag) => tag.title)).size, tags.length)
  assert.equal(new Set(tags.map((tag) => tag.description)).size, tags.length)
  for (const tag of tags) {
    assert.equal(tag.status, 200)
    assert.ok(tag.canonical.startsWith('https://ybinci.com/'))
    assert.ok(!tag.canonical.includes('?') && !tag.canonical.includes('#'))
    const head = renderSeoHead(tag)
    assert.equal((head.match(/rel="canonical"/g) || []).length, 1)
    assert.ok(head.includes('property="og:title"'))
    assert.ok(head.includes('property="og:image"'))
  }
})

test('SSR includes real published content, image gallery, project links and crawlable PDFs before JS', async () => {
  const content = await fixtureContent()
  const template = await readFile('dist-ssr/template.html', 'utf8')
  const result = renderPage('/proje-gunlugu/urans-openfast', content, template)
  assert.equal(result.status, 200)
  assert.ok(result.html.includes(journal.content))
  assert.ok(result.html.includes(`href="${pdfUrl}" target="_blank" rel="noreferrer"`))
  assert.ok(result.html.includes('class="journal-gallery"'))
  assert.ok(result.html.includes('href="/projeler/cift-rotorlu-dengeleme-sistemi"'))
  assert.ok(result.html.indexOf('<meta data-seo="description"') < result.html.indexOf('</head>'))
  assert.ok(!result.html.includes('PRIVATE-DRAFT') && !result.html.includes('PRIVATE-PROJECT'))
  const projectList = renderPage('/projeler', content, template).html
  assert.ok(projectList.includes('href="/projeler/rotor-aerodinamigi"'))
  for (const item of content.projects) {
    assert.equal(renderPage(`/projeler/${item.slug}`, content, template).status, 200)
  }
})

test('drafts/missing pages and admin are noindex; journal ID alias has slug canonical', async () => {
  const content = await fixtureContent()
  for (const path of ['/admin', '/projeler/unpublished-project', '/proje-gunlugu/unpublished-note', '/does-not-exist']) {
    assert.ok(resolveSeo(path, content).robots.startsWith('noindex'))
  }
  assert.equal(resolveSeo('/proje-gunlugu/unpublished-note', content).status, 404)
  assert.equal(resolveSeo('/projeler/unknown', getStaticContent()).status, 503)
  assert.equal(resolveSeo('/proje-gunlugu/journal-1', content).canonical, 'https://ybinci.com/proje-gunlugu/urans-openfast')
})

test('sitemap has canonical published URLs, no drafts/admin, no invented lastmod', async () => {
  const content = await fixtureContent()
  const xml = createSitemap(content)
  assert.ok(xml.includes('https://ybinci.com/projeler/rotor-aerodinamigi'))
  assert.ok(xml.includes('https://ybinci.com/proje-gunlugu/urans-openfast'))
  assert.ok(!xml.includes('/admin') && !xml.includes('unpublished'))
  assert.equal((xml.match(/<loc>/g) || []).length, 6 + content.projects.length + content.journal.length)
  assert.ok(xml.includes('<lastmod>2026-10-23T00:00:00.000Z</lastmod>'))
  const staticEntry = xml.match(/<url><loc>https:\/\/ybinci.com\/projeler\/cift-rotorlu-dengeleme-sistemi<\/loc>(.*?)<\/url>/)[1]
  assert.equal(staticEntry, '')
})

test('SEO attributes, JSON-LD and hydration payload escape untrusted content', async () => {
  const content = await fixtureContent()
  content.journal[0].title = 'Test $& </title><script>alert(1)</script>'
  content.journal[0].summary = '" onload="alert(1)'
  const template = await readFile('dist-ssr/template.html', 'utf8')
  const html = renderPage('/proje-gunlugu/urans-openfast', content, template).html
  assert.ok(!html.includes('<script>alert(1)</script>'))
  assert.ok(!html.includes('<!--seo-head-->'))
  assert.ok(html.includes('Test $&amp;'))
  const payload = html.match(/<script id="public-content" type="application\/json">([\s\S]*?)<\/script>/)[1]
  const seed = JSON.parse(payload)
  assert.equal(seed.path, '/proje-gunlugu/urans-openfast')
  assert.equal(seed.content.journal[0].title, content.journal[0].title)
  assert.ok(!serializeJson({ value: '</script>' }).includes('</script>'))
})

test('HTTP handlers return SSR, noindex headers, live sitemap, HEAD, outage protection', async () => {
  const originalFetch = globalThis.fetch
  const originalUrl = process.env.VITE_SUPABASE_URL
  const originalKey = process.env.VITE_SUPABASE_ANON_KEY
  process.env.VITE_SUPABASE_URL = publicUrl
  process.env.VITE_SUPABASE_ANON_KEY = 'test-public-key'
  globalThis.fetch = mockDatabase()
  const config = JSON.parse(await readFile('vercel.json', 'utf8'))
  const staticXml = new Map(await Promise.all(['/sitemap.xml', '/sitemap-snapshot.xml'].map(async (path) => (
    [path, await readFile(`dist${path}`, 'utf8')]
  ))))
  const catchAll = config.rewrites.find((route) => route.source.startsWith('/:path('))
  const matcher = new RegExp(`^/${catchAll.source.slice('/:path'.length)}$`)
  const server = createServer((request, response) => {
    const path = new URL(request.url, 'http://localhost').pathname
    if (staticXml.has(path)) {
      for (const header of config.headers.find((route) => route.source === path).headers) response.setHeader(header.key, header.value)
      response.statusCode = 200
      response.end(request.method === 'HEAD' ? undefined : staticXml.get(path))
      return
    }
    const rewrite = config.rewrites.find((route) => route.source === path)
    const handler = rewrite?.destination === '/api/sitemap' || path === '/api/sitemap' ? sitemapHandler
      : path === '/api/render' || matcher.test(path) ? renderHandler : null
    if (!handler) { response.statusCode = 404; response.end('Not found'); return }
    Promise.resolve(handler(request, response)).catch((error) => { response.statusCode = 500; response.end(error.message) })
  })
  server.listen(0, '127.0.0.1')
  await once(server, 'listening')
  const origin = `http://127.0.0.1:${server.address().port}`
  try {
    const page = await originalFetch(`${origin}/proje-gunlugu/urans-openfast`)
    assert.equal(page.status, 200)
    assert.ok((await page.text()).includes(journal.content))
    const admin = await originalFetch(`${origin}/admin`)
    assert.equal(admin.headers.get('x-robots-tag'), 'noindex, nofollow')
    const adminHtml = await admin.text()
    assert.ok(adminHtml.includes('Admin girişi') && !adminHtml.includes('name="pdfUrl"'))
    const sitemap = await originalFetch(`${origin}/sitemap.xml`)
    assert.equal(sitemap.status, 200)
    assert.ok(sitemap.headers.get('content-type').includes('application/xml'))
    const indexXml = await sitemap.text()
    assert.ok(indexXml.includes('<sitemapindex ') && !indexXml.includes('<html'))
    assert.ok(indexXml.includes('https://ybinci.com/sitemap-live.xml'))
    const snapshot = await originalFetch(`${origin}/sitemap-snapshot.xml`)
    assert.equal(snapshot.status, 200)
    assert.ok((await snapshot.text()).includes('cift-rotorlu-dengeleme-sistemi'))
    const live = await originalFetch(`${origin}/sitemap-live.xml`)
    assert.equal(live.status, 200)
    assert.ok((await live.text()).includes(journal.slug))
    const verification = await verifySitemapDeployment(origin, { fetchImpl: originalFetch, report: () => {} })
    assert.equal(verification.length, 3)
    assert.ok(verification.some((result) => result.url.endsWith('/sitemap-live.xml') && result.requestId))
    const apiMissing = await originalFetch(`${origin}/api/missing`)
    assert.equal(apiMissing.status, 404)
    assert.ok(!(await apiMissing.text()).includes('<html'))
    const misplaced = await originalFetch(`${origin}/api/render?path=/sitemap.xml`)
    assert.equal(misplaced.status, 404)
    assert.ok(!(await misplaced.text()).includes('<html'))
    const head = await originalFetch(`${origin}/proje-gunlugu/urans-openfast`, { method: 'HEAD' })
    assert.equal(head.status, 200)
    assert.equal(await head.text(), '')
    const draft = await originalFetch(`${origin}/proje-gunlugu/unpublished-note`)
    assert.equal(draft.status, 404)
    assert.ok(draft.headers.get('x-robots-tag').includes('noindex'))
    globalThis.fetch = mockDatabase({ fail: true })
    const unavailable = await originalFetch(`${origin}/sitemap-live.xml`)
    assert.equal(unavailable.status, 200)
    assert.equal(unavailable.headers.get('x-sitemap-source'), 'static')
    assert.ok(unavailable.headers.get('content-type').includes('application/xml'))
    assert.equal(unavailable.headers.get('retry-after'), null)
    const fallbackXml = await unavailable.text()
    assert.ok(fallbackXml.startsWith('<?xml version="1.0" encoding="UTF-8"?>'))
    assert.ok(fallbackXml.includes('https://ybinci.com/projeler/cift-rotorlu-dengeleme-sistemi'))
    assert.ok(!fallbackXml.includes('/admin') && !fallbackXml.includes('unpublished'))
    const fallback = await originalFetch(`${origin}/projeler`)
    assert.equal(fallback.status, 200)
    assert.ok((await fallback.text()).includes('Çift Rotorlu Dengeleme Sistemi'))
  } finally {
    globalThis.fetch = originalFetch
    if (originalUrl === undefined) delete process.env.VITE_SUPABASE_URL
    else process.env.VITE_SUPABASE_URL = originalUrl
    if (originalKey === undefined) delete process.env.VITE_SUPABASE_ANON_KEY
    else process.env.VITE_SUPABASE_ANON_KEY = originalKey
    await new Promise((resolve) => server.close(resolve))
  }
})

test('physical sitemap index/snapshot exist; SSR rewrite excludes sitemap, API and asset paths', async () => {
  const config = JSON.parse(await readFile('vercel.json', 'utf8'))
  assert.ok(!config.rewrites.some((route) => route.source === '/sitemap.xml'))
  assert.equal(config.rewrites[0].source, '/sitemap-live.xml')
  assert.equal(config.rewrites[0].destination, '/api/sitemap')
  const catchAll = config.rewrites.find((route) => route.source.startsWith('/:path('))
  const matcher = new RegExp(`^/${catchAll.source.slice('/:path'.length)}$`)
  for (const path of ['/sitemap.xml', '/sitemap-live.xml', '/sitemap-snapshot.xml', '/api/sitemap', '/api/render', '/api/missing', '/assets/index.js', '/robots.txt']) {
    assert.ok(!matcher.test(path), `${path} must not be handled by React SSR`)
  }
  for (const path of ['/', '/projeler', '/projeler/rotor', '/proje-gunlugu/test', '/admin', '/hakkimda']) {
    assert.ok(matcher.test(path), `${path} must retain its SSR route`)
  }
  const index = await readFile('dist/sitemap.xml', 'utf8')
  assert.equal(index, createSitemapIndex())
  assert.equal((index.match(/<sitemap>/g) || []).length, 2)
  const snapshot = await readFile('dist/sitemap-snapshot.xml', 'utf8')
  assert.equal(snapshot, createSitemap(getStaticContent()))
  assert.ok(snapshot.startsWith('<?xml ') && snapshot.includes('<urlset '))
  assert.ok(!snapshot.includes('<html') && !snapshot.includes('/admin'))
  for (const project of getStaticContent().projects) assert.ok(snapshot.includes(`/projeler/${project.slug}`))
})

test('deployment verifier rejects HTML at the root, live child or direct production function', async () => {
  const html = '<!doctype html><html><head><title>React app</title></head></html>'
  for (const htmlPath of ['/sitemap.xml', '/sitemap-live.xml', '/api/sitemap']) {
    await assert.rejects(verifySitemapDeployment('https://ybinci.com', {
      report: () => {},
      fetchImpl: async (url) => {
        const path = new URL(url).pathname
        const body = path === htmlPath ? html : path === '/sitemap.xml' ? createSitemapIndex() : createSitemap(getStaticContent())
        return new Response(body, { status: 200, headers: {
          'content-type': path === htmlPath ? 'text/html; charset=utf-8' : 'application/xml; charset=utf-8',
          ...(path === '/api/sitemap' || path === '/sitemap-live.xml' ? { 'x-sitemap-request-id': 'function-request' } : {}),
        } })
      },
    }), htmlPath === '/api/sitemap' ? /production sitemap function/ : /expected application\/xml/)
  }
})

function sitemapResponse() {
  return {
    statusCode: null, headers: {}, body: undefined,
    setHeader(name, value) { this.headers[name.toLowerCase()] = value },
    end(body) { this.body = body },
  }
}

async function runSitemap({ fetchImpl = mockDatabase(), url = publicUrl, anonKey = 'test-public-key', method = 'GET', buildXml } = {}) {
  const logs = { warnings: [], errors: [] }
  const handler = createSitemapHandler({
    loadContent: (options) => loadPublicContent({ ...options, url, anonKey, fetchImpl }),
    ...(buildXml ? { buildXml } : {}),
    logger: {
      warn: (message) => logs.warnings.push(JSON.parse(message)),
      error: (message) => logs.errors.push(JSON.parse(message)),
    },
  })
  const response = sitemapResponse()
  await handler({ method }, response)
  return { response, logs }
}

function assertValidSitemapResponse(response) {
  assert.equal(response.statusCode, 200)
  assert.equal(response.headers['content-type'], 'application/xml; charset=utf-8')
  assert.ok(response.body.startsWith('<?xml version="1.0" encoding="UTF-8"?>'))
  assert.ok(response.body.includes('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'))
  assert.ok(response.body.endsWith('</urlset>'))
  for (const path of Object.keys(pageMetadata)) assert.ok(response.body.includes(`<loc>https://ybinci.com${path}</loc>`))
  assert.ok(!response.body.includes('/admin') && !response.body.includes('unpublished'))
}

test('sitemap returns complete XML for healthy or empty databases', async () => {
  const { response, logs } = await runSitemap()
  assertValidSitemapResponse(response)
  assert.equal(response.headers['x-sitemap-source'], 'complete')
  assert.ok(response.body.includes(journal.slug) && response.body.includes(project.slug))
  assert.equal(logs.warnings.length, 0)
  assert.equal(logs.errors.length, 0)
  const empty = await runSitemap({ fetchImpl: async () => ({ ok: true, json: async () => [] }) })
  assertValidSitemapResponse(empty.response)
  assert.equal(empty.response.headers['x-sitemap-source'], 'complete')
  assert.equal((empty.response.body.match(/<url>/g) || []).length, 6 + getStaticContent().projects.length)
})

test('sitemap tolerates either table failing and keeps published records from the other table', async () => {
  for (const failedTable of ['projects', 'project_journal']) {
    const database = mockDatabase()
    const { response, logs } = await runSitemap({ fetchImpl: async (input, options) => (
      new URL(input).pathname.endsWith(`/${failedTable}`)
        ? { ok: false, status: 403 }
        : database(input, options)
    ) })
    assertValidSitemapResponse(response)
    assert.equal(response.headers['x-sitemap-source'], 'partial')
    assert.equal(response.body.includes(project.slug), failedTable !== 'projects')
    assert.equal(response.body.includes(journal.slug), failedTable !== 'project_journal')
    assert.ok(response.body.includes('cift-rotorlu-dengeleme-sistemi'))
    assert.equal(logs.warnings[0].event, 'sitemap_fallback')
    assert.equal(logs.warnings[0].requestId, response.headers['x-sitemap-request-id'])
    assert.deepEqual(logs.warnings[0].failures, [{ table: failedTable, reason: 'http_error', status: 403 }])
    assert.equal(logs.errors.length, 0)
  }
})

test('network/timeout failures return static XML with safe, useful diagnostics', async () => {
  for (const reason of ['network_error', 'timeout']) {
    const { response, logs } = await runSitemap({ fetchImpl: async () => {
      if (reason === 'timeout') throw new DOMException('Sensitive upstream text', 'TimeoutError')
      throw new TypeError(`Failed to fetch ${publicUrl}?apikey=test-public-key`)
    } })
    assertValidSitemapResponse(response)
    assert.equal(response.headers['x-sitemap-source'], 'static')
    assert.deepEqual(logs.warnings[0].failures.map((failure) => failure.reason), [reason, reason])
    assert.ok(!JSON.stringify(logs).includes('test-public-key'))
    assert.ok(!JSON.stringify(logs).includes(publicUrl))
    assert.ok(!JSON.stringify(logs).includes('Sensitive upstream text'))
  }
})

test('missing/invalid configuration is logged without keys and returns static XML', async () => {
  for (const [url, anonKey, expectedReason] of [
    ['', '', 'missing_configuration'], ['not-a-url', 'test-public-key', 'invalid_configuration'],
  ]) {
    const { response, logs } = await runSitemap({ url, anonKey })
    assertValidSitemapResponse(response)
    assert.equal(response.headers['x-sitemap-source'], 'static')
    assert.equal(logs.warnings[0].failures[0].reason, expectedReason)
    assert.equal(logs.warnings[0].failures[0].hasAnonKey, Boolean(anonKey))
    assert.ok(!JSON.stringify(logs).includes('test-public-key'))
  }
})

test('invalid upstream JSON is a logged fallback, not a broken XML response', async () => {
  for (const invalidJson of [false, true]) {
    const { response, logs } = await runSitemap({ fetchImpl: async () => ({
      ok: true, status: 200,
      json: async () => {
        if (invalidJson) throw new SyntaxError('Unexpected token')
        return { error: 'not an array' }
      },
    }) })
    assertValidSitemapResponse(response)
    assert.equal(logs.warnings[0].failures[0].reason, invalidJson ? 'invalid_json' : 'invalid_response')
  }
})

test('actual generation failures return HTTP 500, never a fake successful sitemap', async () => {
  for (const buildXml of [
    () => { throw new TypeError('Sensitive internal text: test-public-key') },
    () => '<html>Invalid output</html>',
  ]) {
    const { response, logs } = await runSitemap({ buildXml })
    assert.equal(response.statusCode, 500)
    assert.equal(response.headers['content-type'], 'text/plain; charset=utf-8')
    assert.equal(response.body, 'Sitemap generation failed.')
    assert.equal(response.headers['x-sitemap-source'], undefined)
    assert.equal(logs.errors[0].event, 'sitemap_generation_failed')
    assert.equal(logs.errors[0].requestId, response.headers['x-sitemap-request-id'])
    assert.ok(logs.errors[0].frames.length > 0)
    assert.ok(!JSON.stringify(logs).includes('test-public-key'))
  }
  const unexpectedRuntimeError = await runSitemap({ fetchImpl: async () => null })
  assert.equal(unexpectedRuntimeError.response.statusCode, 500)
  assert.equal(unexpectedRuntimeError.logs.errors[0].errorType, 'TypeError')
})

test('sitemap HEAD has correct headers and no body, unsupported methods return 405', async () => {
  const { response } = await runSitemap({ method: 'HEAD', fetchImpl: mockDatabase({ fail: true }) })
  assert.equal(response.statusCode, 200)
  assert.equal(response.headers['content-type'], 'application/xml; charset=utf-8')
  assert.equal(response.headers['x-sitemap-source'], 'static')
  assert.equal(response.body, undefined)
  const post = await runSitemap({ method: 'POST' })
  assert.equal(post.response.statusCode, 405)
  assert.equal(post.response.headers.allow, 'GET, HEAD')
})

const windJournalPath = '/proje-gunlugu/ruzgar-turbini-tarla-analizleri-arastirma-ozeti'

async function windContent() {
  const content = await fixtureContent()
  content.journal = [{ ...content.journal[0], slug: windJournalPath.split('/').pop(),
    title: 'Rüzgâr Türbini ve Rüzgâr Tarlası Analizleri: Yöntem ve Yazılım Araştırması' }]
  return content
}

async function runRender(path, options = {}) {
  const logs = { warnings: [], errors: [], responses: [] }
  const handler = createRenderHandler({
    loadContent: () => fixtureContent(),
    logger: {
      warn: (message) => logs.warnings.push(JSON.parse(message)),
      error: (message) => logs.errors.push(JSON.parse(message)),
      info: (message) => logs.responses.push(JSON.parse(message)),
    },
    ...options,
  })
  const response = sitemapResponse()
  await handler({ url: path, method: 'GET' }, response)
  return { response, logs }
}

test('requested published journal path returns HTTP 200, real SSR HTML and one correct canonical', async () => {
  const content = await windContent()
  const handler = createRenderHandler({ loadContent: async () => content })
  const server = createServer((request, response) => handler(request, response))
  server.listen(0, '127.0.0.1')
  await once(server, 'listening')
  try {
    const response = await fetch(`http://127.0.0.1:${server.address().port}${windJournalPath}`)
    assert.equal(response.status, 200)
    assert.equal(response.headers.get('content-type'), 'text/html; charset=utf-8')
    assert.equal(response.headers.get('x-robots-tag'), null)
    assert.ok(response.headers.get('x-ssr-request-id'))
    const html = await response.text()
    assert.ok(html.includes(content.journal[0].title))
    assert.ok(html.includes(content.journal[0].content))
    assert.ok(html.includes('class="journal-gallery"') && html.includes(`href="${pdfUrl}"`))
    assert.equal((html.match(/rel="canonical"/g) || []).length, 1)
    assert.ok(html.includes(`href="https://ybinci.com${windJournalPath}"`))
    assert.ok(!html.includes('content="noindex'))
  } finally { await new Promise((resolve) => server.close(resolve)) }
})

test('upstream outages use known static content but never fake a 200 for an unknown dynamic URL', async () => {
  const unavailable = getStaticContent()
  const staticPage = await runRender('/projeler/cift-rotorlu-dengeleme-sistemi', { loadContent: async () => unavailable })
  assert.equal(staticPage.response.statusCode, 200)
  assert.equal(staticPage.response.headers['x-robots-tag'], undefined)
  const missingDuringOutage = await runRender(windJournalPath, { loadContent: async () => unavailable })
  assert.equal(missingDuringOutage.response.statusCode, 503)
  assert.equal(missingDuringOutage.response.headers['retry-after'], '60')
  assert.equal(missingDuringOutage.response.headers['x-robots-tag'], undefined)
  assert.ok(!missingDuringOutage.response.body.includes('content="noindex'))
  const notFound = await runRender('/proje-gunlugu/actually-missing')
  assert.equal(notFound.response.statusCode, 404)
  assert.equal(notFound.response.headers['x-robots-tag'], 'noindex, follow')
  const draft = await runRender('/proje-gunlugu/unpublished-note')
  assert.equal(draft.response.statusCode, 404)
})

test('a projects-table failure cannot turn a successfully loaded journal page into 503/noindex', async () => {
  const content = await windContent()
  content.available.projects = false
  const { response, logs } = await runRender(windJournalPath, { loadContent: async ({ onUnavailable }) => {
    onUnavailable({ table: 'projects', reason: 'http_error', status: 503 })
    return content
  } })
  assert.equal(response.statusCode, 200)
  assert.equal(response.headers['x-robots-tag'], undefined)
  assert.equal(logs.warnings[0].event, 'ssr_public_content_unavailable')
  assert.equal(logs.warnings[0].failures[0].table, 'projects')
  assert.equal(logs.errors.length, 0)
})

test('SSR module, template, data and rendering failures have separate diagnostic stages and HTTP 500', async () => {
  const missingModule = Object.assign(new Error('Sensitive test-public-key'), { code: 'ERR_MODULE_NOT_FOUND' })
  const missingFile = Object.assign(new Error('Sensitive test-public-key'), { code: 'ENOENT' })
  for (const [stage, options] of [
    ['renderer_load', { loadRenderer: async () => { throw missingModule } }],
    ['template_load', { loadTemplate: async () => { throw missingFile } }],
    ['content_load', { loadContent: async () => { throw new TypeError('Sensitive test-public-key') } }],
    ['render', { loadTemplate: async () => '<html>Wrong template</html>' }],
  ]) {
    const { response, logs } = await runRender(windJournalPath, options)
    assert.equal(response.statusCode, 500)
    assert.equal(response.headers['x-robots-tag'], undefined)
    assert.equal(logs.errors[0].event, 'ssr_error')
    assert.equal(logs.errors[0].stage, stage)
    assert.equal(logs.errors[0].requestId, response.headers['x-ssr-request-id'])
    assert.ok(!JSON.stringify(logs).includes('test-public-key'))
  }
})

test('deployment SSR artifact runs without node_modules and without depending on process.cwd()', async () => {
  const config = JSON.parse(await readFile('vercel.json', 'utf8'))
  assert.equal(config.functions['api/render.js'].includeFiles, 'dist-ssr/**')
  const deployment = await mkdtemp(join(tmpdir(), 'ybinci-ssr-artifact-'))
  const originalCwd = process.cwd()
  try {
    const files = ['api/render.js', 'src/lib/publicContent.js', 'src/lib/seo.js',
      'src/data/projects.js', 'src/data/projectJournal.js', 'package.json',
      'dist-ssr/entry-server.js', 'dist-ssr/template.html']
    for (const file of files) {
      const destination = join(deployment, file)
      await mkdir(dirname(destination), { recursive: true })
      await copyFile(file, destination)
    }
    const content = await windContent()
    const { createRenderHandler: standaloneHandler } = await import(pathToFileURL(join(deployment, 'api/render.js')).href)
    const handler = standaloneHandler({ loadContent: async () => content, logger: { warn() {}, error() {}, info() {} } })
    const response = sitemapResponse()
    process.chdir(tmpdir())
    await handler({ url: windJournalPath, method: 'GET' }, response)
    assert.equal(response.statusCode, 200)
    assert.ok(response.body.includes(content.journal[0].title))
    assert.equal(response.headers['x-robots-tag'], undefined)
  } finally {
    process.chdir(originalCwd)
    assert.equal(dirname(deployment), resolve(tmpdir()))
    assert.ok(basename(deployment).startsWith('ybinci-ssr-artifact-'))
    await rm(deployment, { recursive: true, force: true })
  }
})
