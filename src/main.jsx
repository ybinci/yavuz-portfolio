import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { normalizePath } from './lib/seo.js'

const seedElement = document.getElementById('public-content')
const seed = seedElement ? JSON.parse(seedElement.textContent) : null
const app = (
  <StrictMode>
    <App initialContent={seed?.content} refreshContent={seed?.refreshContent} />
  </StrictMode>
)
const root = document.getElementById('root')
if (seed?.path === normalizePath(window.location.pathname)) hydrateRoot(root, app)
else createRoot(root).render(app)
