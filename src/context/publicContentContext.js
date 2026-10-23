import { createContext, useContext } from 'react'

export const PublicContentContext = createContext(null)

export function usePublicContent() {
  return useContext(PublicContentContext)
}
