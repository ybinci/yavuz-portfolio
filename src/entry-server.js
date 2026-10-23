import { createElement } from 'react'
import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router-dom'
import { AppLayout } from './App.jsx'
import { PublicContentProvider } from './context/PublicContent.jsx'
import { normalizePath, renderSeoHead, resolveSeo, serializeJson } from './lib/seo.js'

export { loadPublicContent, getStaticContent } from './lib/publicContent.js'
export { createSitemap, normalizePath, SITE_URL } from './lib/seo.js'

export function renderPage(path, content, template, { refreshContent = false } = {}) {
  if (typeof template !== 'string' || ['<!--seo-head-->', '<!--app-html-->', '<!--public-content-->']
    .some((marker) => !template.includes(marker))) {
    throw new Error('Invalid SSR template: required placeholders are missing')
  }
  const seo = resolveSeo(path, content)
  const markup = renderToString(
    createElement(StaticRouter, { location: path },
      createElement(PublicContentProvider, { initialContent: content, refreshContent },
        createElement(AppLayout))),
  )
  const seed = `<script id="public-content" type="application/json">${serializeJson({ path: normalizePath(path), content, refreshContent })}</script>`
  return {
    status: seo.status,
    robots: seo.robots,
    html: template.replace('<!--seo-head-->', () => renderSeoHead(seo))
      .replace('<!--app-html-->', () => markup)
      .replace('<!--public-content-->', () => seed),
  }
}
