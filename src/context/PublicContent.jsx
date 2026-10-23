import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { getStaticContent, loadPublicContent } from '../lib/publicContent.js'
import { PublicContentContext } from './publicContentContext.js'

export function PublicContentProvider({ initialContent, refreshContent = false, children }) {
  const { pathname } = useLocation()
  const firstLoad = useRef(true)
  const [content, setContent] = useState(() => initialContent ?? getStaticContent())
  const [isLoading, setIsLoading] = useState(!initialContent)

  useEffect(() => {
    const skipInitialRequest = firstLoad.current && initialContent && !refreshContent
    firstLoad.current = false
    if (skipInitialRequest) return undefined
    let active = true
    setIsLoading(true)
    loadPublicContent({
      url: import.meta.env.VITE_SUPABASE_URL,
      anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
    }).then((nextContent) => {
      if (active) {
        setContent(nextContent)
        setIsLoading(false)
      }
    })
    return () => { active = false }
  }, [initialContent, refreshContent, pathname])

  return (
    <PublicContentContext.Provider value={{ ...content, isLoading }}>
      {children}
    </PublicContentContext.Provider>
  )
}
