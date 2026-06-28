import { useEffect, useState } from 'react'

const navItems = [
  { id: 'home', label: 'Ana Sayfa' },
  { id: 'about', label: 'Hakkımda' },
  { id: 'projects', label: 'Projeler' },
  { id: 'services', label: 'Hizmetler' },
  { id: 'contact', label: 'İletişim' },
]

function Navbar({ activePage, onNavigate }) {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => setIsOpen(false), [activePage])

  const goTo = (page) => {
    onNavigate(page)
    setIsOpen(false)
  }

  return (
    <header className="site-header">
      <nav className="navbar" aria-label="Ana navigasyon">
        <button className="logo" onClick={() => goTo('home')} aria-label="Ana sayfaya git">
          <span className="logo-mark" aria-hidden="true">YBİ</span>
          <span>Yavuz Bahadır İnci</span>
        </button>

        <button
          className="menu-toggle"
          type="button"
          aria-expanded={isOpen}
          aria-controls="main-menu"
          aria-label={isOpen ? 'Menüyü kapat' : 'Menüyü aç'}
          onClick={() => setIsOpen((open) => !open)}
        >
          <span />
          <span />
          <span />
        </button>

        <div className={`nav-links ${isOpen ? 'is-open' : ''}`} id="main-menu">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={activePage === item.id ? 'active' : ''}
              onClick={() => goTo(item.id)}
              aria-current={activePage === item.id ? 'page' : undefined}
            >
              {item.label}
            </button>
          ))}
        </div>
      </nav>
    </header>
  )
}

export default Navbar
