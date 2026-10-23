import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { usePublicContent } from '../context/publicContentContext.js'
import { renderSeoHead, resolveSeo } from '../lib/seo.js'

export default function Seo() {
  const { pathname } = useLocation()
  const content = usePublicContent()

  useEffect(() => {
    const template = document.createElement('template')
    template.innerHTML = renderSeoHead(resolveSeo(pathname, content, content.isLoading))
    document.head.querySelectorAll('[data-seo]').forEach((element) => element.remove())
    document.head.append(template.content)
  }, [pathname, content])

  return null
}
