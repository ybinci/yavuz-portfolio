import { useEffect, useState } from 'react'
import Navbar from './components/Navbar'
import Home from './components/Home'
import About from './components/About'
import Projects from './components/Projects'
import Services from './components/Services'
import Contact from './components/Contact'
import Admin from './components/Admin'
import './App.css'

const pages = {
  home: Home,
  about: About,
  projects: Projects,
  services: Services,
  contact: Contact,
  admin: Admin,
}

const getInitialPage = () => (
  window.location.pathname === '/admin'
    ? 'admin'
    : window.location.hash.startsWith('#project-') ? 'projects' : 'home'
)

function App() {
  const [activePage, setActivePage] = useState(getInitialPage)
  const ActivePage = pages[activePage]

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [activePage])

  const navigate = (page) => {
    if (!pages[page]) return

    if (page === 'admin') {
      window.history.replaceState(null, '', '/admin')
      setActivePage(page)
      return
    }

    if (window.location.pathname === '/admin') {
      window.history.replaceState(null, '', '/')
    }

    if (page !== 'projects' && window.location.hash.startsWith('#project-')) {
      window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}`)
    }

    setActivePage(page)
  }

  return (
    <div className="site-shell">
      <Navbar activePage={activePage} onNavigate={navigate} />
      <main className="page-content">
        <ActivePage onNavigate={navigate} />
      </main>
    </div>
  )
}

export default App
