import { randomUUID } from 'node:crypto'
import { loadPublicContent } from '../src/lib/publicContent.js'
import { createSitemap } from '../src/lib/seo.js'

export function createSitemapHandler({ loadContent = loadPublicContent, buildXml = createSitemap, logger = console } = {}) {
  return async function handler(request, response) {
    if (!['GET', 'HEAD'].includes(request.method)) {
      response.setHeader('Allow', 'GET, HEAD')
      response.statusCode = 405
      response.end()
      return
    }

    const requestId = randomUUID()
    response.setHeader('X-Sitemap-Request-Id', requestId)
    response.setHeader('Cache-Control', 'no-store')

    try {
      const failures = []
      const content = await loadContent({
        url: process.env.VITE_SUPABASE_URL,
        anonKey: process.env.VITE_SUPABASE_ANON_KEY,
        onUnavailable: (diagnostic) => failures.push(diagnostic),
      })
      // A recoverable upstream failure still leaves a valid static/partial sitemap.
      // Build before committing 200 so actual generation failures remain HTTP errors.
      const xml = buildXml(content)
      if (typeof xml !== 'string' || !xml.startsWith('<?xml ')
        || !xml.includes('xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"')
        || !xml.endsWith('</urlset>')) {
        throw new Error('Invalid sitemap output')
      }
      const availableCount = [content.available.projects, content.available.journal].filter(Boolean).length
      const source = ['static', 'partial', 'complete'][availableCount]
      if (source !== 'complete') {
        logger.warn(JSON.stringify({
          event: 'sitemap_fallback', requestId, source,
          available: content.available, failures,
          projectCount: content.projects.length, journalCount: content.journal.length,
        }))
      }
      response.statusCode = 200
      response.setHeader('Content-Type', 'application/xml; charset=utf-8')
      response.setHeader('X-Sitemap-Source', source)
      logger.info?.(JSON.stringify({ event: 'sitemap_served', requestId, source }))
      response.end(request.method === 'HEAD' ? undefined : xml)
    } catch (error) {
      // Error messages/causes may contain request URLs or credentials. Log safe frames only.
      logger.error(JSON.stringify({
        event: 'sitemap_generation_failed', requestId, errorType: error?.name ?? 'UnknownError',
        frames: typeof error?.stack === 'string'
          ? error.stack.split('\n').filter((line) => /^\s+at /.test(line)).slice(0, 6) : [],
      }))
      response.statusCode = 500
      response.setHeader('Content-Type', 'text/plain; charset=utf-8')
      response.end(request.method === 'HEAD' ? undefined : 'Sitemap generation failed.')
    }
  }
}

export default createSitemapHandler()
