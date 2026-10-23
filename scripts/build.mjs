import { readFile, writeFile } from 'node:fs/promises'
import { build } from 'vite'

await build({ configLoader: 'native' })
const template = await readFile('dist/index.html', 'utf8')
for (const marker of ['<!--seo-head-->', '<!--app-html-->', '<!--public-content-->']) {
  if (!template.includes(marker)) throw new Error(`Missing SSR template marker: ${marker}`)
}
await build({
  configLoader: 'native',
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
