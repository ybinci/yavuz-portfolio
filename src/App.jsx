import { useEffect } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
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

function AppLayout() {
  return (
    <div className="site-shell">
      <ScrollToTop />
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
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  )
}

export default App
