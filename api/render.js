import { readFile } from 'node:fs/promises'
import { randomUUID } from 'node:crypto'
import { getStaticContent, loadPublicContent } from '../src/lib/publicContent.js'
import { normalizePath, SITE_URL } from '../src/lib/seo.js'

let rendererPromise
let templatePromise

async function loadDefaultRenderer() {
  // Load inside the request error boundary. A missing runtime dependency must
  // produce a diagnostic response instead of killing function initialization.
  rendererPromise ??= import('../dist-ssr/entry-server.js')
  try { return await rendererPromise }
  catch (error) { rendererPromise = undefined; throw error }
}

async function loadDefaultTemplate() {
  // Module-relative paths also work when Vercel's cwd differs from the project.
  // Do not start a rejecting filesystem promise at module initialization time.
  templatePromise ??= readFile(new URL('../dist-ssr/template.html', import.meta.url), 'utf8')
  try { return await templatePromise }
  catch (error) { templatePromise = undefined; throw error }
}

function safeError(error) {
  return {
    errorType: error?.name ?? 'UnknownError',
    code: typeof error?.code === 'string' ? error.code : undefined,
    frames: typeof error?.stack === 'string'
      ? error.stack.split('\n').filter((line) => /^\s+at /.test(line)).slice(0, 6) : [],
  }
}

export function createRenderHandler({
  loadRenderer = loadDefaultRenderer,
  loadTemplate = loadDefaultTemplate,
  loadContent = loadPublicContent,
  logger = console,
} = {}) {
  return async function handler(request, response) {
    if (!['GET', 'HEAD'].includes(request.method)) {
      response.setHeader('Allow', 'GET, HEAD')
      response.statusCode = 405
      response.end()
      return
    }
    const requestId = randomUUID()
    response.setHeader('X-SSR-Request-Id', requestId)
    response.setHeader('Cache-Control', 'private, no-store')
    let path = '/'
    let stage = 'request'

    try {
      const url = new URL(request.url, SITE_URL)
      path = normalizePath(url.searchParams.get('path') || url.pathname)
      if (path === '/api' || path.startsWith('/api/') || /^\/sitemap(?:-[^/]+)?\.xml$/.test(path)) {
        logger.error(JSON.stringify({ event: 'reserved_route_reached_renderer', requestId, path }))
        response.statusCode = 404
        response.setHeader('Content-Type', 'text/plain; charset=utf-8')
        response.setHeader('X-Robots-Tag', 'noindex')
        response.end(request.method === 'HEAD' ? undefined : 'This route must not be served by the HTML renderer.')
        return
      }

      stage = 'renderer_load'
      const { renderPage } = await loadRenderer()
      stage = 'template_load'
      const template = await loadTemplate()
      stage = 'content_load'
      const admin = path === '/admin' || path.startsWith('/admin/')
      const failures = []
      const content = admin ? getStaticContent() : await loadContent({
        url: process.env.VITE_SUPABASE_URL,
        anonKey: process.env.VITE_SUPABASE_ANON_KEY,
        onUnavailable: (diagnostic) => failures.push(diagnostic),
      })
      if (failures.length) {
        logger.warn(JSON.stringify({ event: 'ssr_public_content_unavailable', requestId, path, failures, available: content.available }))
      }

      stage = 'render'
      const result = renderPage(path, content, template, {
        refreshContent: !content.available.projects || !content.available.journal,
      })
      response.statusCode = result.status
      response.setHeader('Content-Type', 'text/html; charset=utf-8')
      if (result.status < 500 && result.robots.startsWith('noindex')) response.setHeader('X-Robots-Tag', result.robots)
      if (result.status === 503) response.setHeader('Retry-After', '60')
      logger.info?.(JSON.stringify({ event: 'ssr_response', requestId, path, status: result.status, available: content.available }))
      response.end(request.method === 'HEAD' ? undefined : result.html)
    } catch (error) {
      logger.error(JSON.stringify({ event: 'ssr_error', requestId, path, stage, ...safeError(error) }))
      response.statusCode = 500
      response.setHeader('Content-Type', 'text/plain; charset=utf-8')
      response.end(request.method === 'HEAD' ? undefined : 'Sayfa oluşturulamadı. Lütfen daha sonra tekrar deneyin.')
    }
  }
}

export default createRenderHandler()
