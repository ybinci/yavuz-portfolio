import { pathToFileURL } from 'node:url'

function xmlLocations(xml) {
  return [...xml.matchAll(/<loc>\s*([^<]+)\s*<\/loc>/g)].map((match) => (
    match[1].trim().replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"').replace(/&#39;/g, "'")
  ))
}

export async function verifySitemapDeployment(origin, { fetchImpl = fetch, report = console.info } = {}) {
  const base = new URL(origin).origin
  const queue = [new URL('/sitemap.xml', base).href]
  const seen = new Set()
  const results = []
  while (queue.length) {
    const url = queue.shift()
    if (seen.has(url)) continue
    if (seen.size >= 20) throw new Error('Too many sitemap files to verify.')
    seen.add(url)
    const response = await fetchImpl(url, { signal: AbortSignal.timeout(20000), redirect: 'follow' })
    const type = response.headers.get('content-type') || ''
    const xml = await response.text()
    if (response.status !== 200) throw new Error(`${url}: expected HTTP 200, received ${response.status}`)
    if (!/^application\/xml(?:\s*;|$)/i.test(type)) throw new Error(`${url}: expected application/xml, received ${type}`)
    const root = xml.trim().replace(/^<\?xml[^?]*\?>\s*/, '').match(/^<(urlset|sitemapindex)\b[^>]*>/)
    if (!root || !root[0].includes('xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"')
      || !xml.trim().endsWith(`</${root[1]}>`) || /<!doctype\s+html|<html\b/i.test(xml)) {
      throw new Error(`${url}: invalid sitemap XML; HTML must never be returned here.`)
    }
    const locations = xmlLocations(xml)
    if (!locations.length) throw new Error(`${url}: empty sitemap`)
    const result = { url, status: response.status, contentType: type, root: root[1], locations: locations.length,
      source: response.headers.get('x-sitemap-source'), requestId: response.headers.get('x-sitemap-request-id') }
    report(JSON.stringify(result))
    results.push(result)
    if (root[1] === 'sitemapindex') {
      for (const location of locations) {
        // Preview URLs can still verify the canonical production sitemap index.
        const child = new URL(location)
        if (child.origin !== 'https://ybinci.com' && child.origin !== base) {
          throw new Error(`Unexpected sitemap origin: ${child.origin}`)
        }
        queue.push(new URL(child.pathname + child.search, base).href)
      }
    }
  }
  // A physical index alone cannot prove that the production function is deployed.
  const apiUrl = new URL('/api/sitemap', base).href
  const api = await fetchImpl(apiUrl, { signal: AbortSignal.timeout(20000), redirect: 'follow' })
  const apiXml = await api.text()
  if (api.status !== 200 || !/^application\/xml(?:\s*;|$)/i.test(api.headers.get('content-type') || '')
    || !api.headers.get('x-sitemap-request-id') || !/^<\?xml\s/.test(apiXml) || !apiXml.includes('<urlset ')) {
    throw new Error(`${apiUrl}: production sitemap function did not return its XML response and request ID.`)
  }
  report(JSON.stringify({ url: apiUrl, status: api.status, requestId: api.headers.get('x-sitemap-request-id'), functionVerified: true }))
  return results
}

if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) {
  try {
    await verifySitemapDeployment(process.argv[2] || 'https://ybinci.com')
    console.info('PASS: sitemap index, child XML files and production function verified.')
  } catch (error) {
    console.error(`FAIL: ${error.message}`)
    process.exitCode = 1
  }
}
