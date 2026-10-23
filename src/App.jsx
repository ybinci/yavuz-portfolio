import { useEffect } from 'react'
import { BrowserRouter, Link, Route, Routes, useLocation } from 'react-router-dom'
import { PublicContentProvider } from './context/PublicContent.jsx'
import Seo from './components/Seo.jsx'
import Navbar from './components/Navbar'
import Home from './components/Home'
import About from './components/About'
import Projects from './components/Projects'
import ProjectJournal from './components/ProjectJournal'
import Services from './components/Services'
import Contact from './components/Contact'
import Admin from './components/Admin'
import './App.css'

function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [pathname])

  return null
}

export function AppLayout() {
  return (
    <div className="site-shell">
      <ScrollToTop />
      <Seo />
      <Navbar />
      <main className="page-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/hakkimda" element={<About />} />
          <Route path="/projeler" element={<Projects />} />
          <Route path="/projeler/:slug" element={<Projects />} />
          <Route path="/proje-gunlugu" element={<ProjectJournal />} />
          <Route path="/proje-gunlugu/:slug" element={<ProjectJournal />} />
          <Route path="/hizmetler" element={<Services />} />
          <Route path="/iletisim" element={<Contact />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="*" element={(
            <section className="page-panel section">
              <h1>Sayfa bulunamadı</h1>
              <Link className="button button-primary" to="/">Ana sayfaya dön</Link>
            </section>
          )} />
        </Routes>
      </main>
    </div>
  )
}

function App({ initialContent, refreshContent }) {
  return (
    <BrowserRouter>
      <PublicContentProvider initialContent={initialContent} refreshContent={refreshContent}>
        <AppLayout />
      </PublicContentProvider>
    </BrowserRouter>
  )
}

export default App
