import { createSitemap, loadPublicContent } from '../dist-ssr/entry-server.js'

export default async function handler(request, response) {
  if (!['GET', 'HEAD'].includes(request.method)) {
    response.setHeader('Allow', 'GET, HEAD')
    response.statusCode = 405
    response.end()
    return
  }
  const content = await loadPublicContent({
    url: process.env.VITE_SUPABASE_URL,
    anonKey: process.env.VITE_SUPABASE_ANON_KEY,
  })
  // Never replace a complete sitemap with a partial list during a database outage.
  if (!content.available.projects || !content.available.journal) {
    response.statusCode = 503
    response.setHeader('Retry-After', '60')
    response.setHeader('Cache-Control', 'no-store')
    response.end('Sitemap temporarily unavailable.')
    return
  }
  response.statusCode = 200
  response.setHeader('Content-Type', 'application/xml; charset=utf-8')
  response.setHeader('Cache-Control', 'no-store')
  response.end(request.method === 'HEAD' ? undefined : createSitemap(content))
}
