import { readFile, writeFile } from 'node:fs/promises'
import { build } from 'vite'
import { createSitemap, createSitemapIndex } from '../src/lib/seo.js'

await build({ configLoader: 'native' })
const template = await readFile('dist/index.html', 'utf8')
for (const marker of ['<!--seo-head-->', '<!--app-html-->', '<!--public-content-->']) {
  if (!template.includes(marker)) throw new Error(`Missing SSR template marker: ${marker}`)
}
await build({
  configLoader: 'native',
  // A self-contained SSR artifact avoids production tracing missing conditional
  // React Router imports such as cookie/set-cookie-parser. Node builtins remain external.
  ssr: { noExternal: true },
  build: {
    ssr: 'src/entry-server.js',
    outDir: 'dist-ssr',
    rollupOptions: { output: { entryFileNames: 'entry-server.js' } },
  },
})
await writeFile('dist-ssr/template.html', template)
const { getStaticContent, renderPage } = await import('../dist-ssr/entry-server.js')
// The filesystem homepage remains useful on static preview hosts as well as Vercel.
const home = renderPage('/', getStaticContent(), template, { refreshContent: true })
await writeFile('dist/index.html', home.html)

// Physical XML assets take precedence over SPA fallbacks on Vercel/static hosts.
// The index also discovers live published content added after this build.
// Keep changeable Supabase records in the live child so unpublishing is reflected
// without leaving stale draft URLs in a build-time snapshot.
await writeFile('dist/sitemap-snapshot.xml', createSitemap(getStaticContent()))
await writeFile('dist/sitemap.xml', createSitemapIndex())
console.info('Sitemap index and snapshot generated in dist/.')
