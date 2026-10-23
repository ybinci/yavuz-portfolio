import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { getStaticContent, loadPublicContent, normalizePath, renderPage, SITE_URL } from '../dist-ssr/entry-server.js'

const templatePromise = readFile(resolve(process.cwd(), 'dist-ssr/template.html'), 'utf8')

export default async function handler(request, response) {
  if (!['GET', 'HEAD'].includes(request.method)) {
    response.setHeader('Allow', 'GET, HEAD')
    response.statusCode = 405
    response.end()
    return
  }
  try {
    const url = new URL(request.url, SITE_URL)
    const path = normalizePath(url.searchParams.get('path') || url.pathname)
    const admin = path === '/admin' || path.startsWith('/admin/')
    const content = admin ? getStaticContent() : await loadPublicContent({
      url: process.env.VITE_SUPABASE_URL,
      anonKey: process.env.VITE_SUPABASE_ANON_KEY,
    })
    const result = renderPage(path, content, await templatePromise, {
      refreshContent: !content.available.projects || !content.available.journal,
    })
    response.statusCode = result.status
    response.setHeader('Content-Type', 'text/html; charset=utf-8')
    response.setHeader('Cache-Control', 'private, no-store')
    if (result.robots.startsWith('noindex')) response.setHeader('X-Robots-Tag', result.robots)
    if (result.status === 503) response.setHeader('Retry-After', '60')
    response.end(request.method === 'HEAD' ? undefined : result.html)
  } catch {
    console.error('Public page rendering failed.')
    response.statusCode = 503
    response.setHeader('X-Robots-Tag', 'noindex')
    response.setHeader('Cache-Control', 'no-store')
    response.setHeader('Retry-After', '60')
    response.end('Sayfa şu anda yüklenemiyor. Lütfen tekrar deneyin.')
  }
}
