import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'

const navItems = [
  { to: '/', label: 'Ana Sayfa', end: true },
  { to: '/hakkimda', label: 'Hakkımda' },
  { to: '/projeler', label: 'Projeler' },
  { to: '/proje-gunlugu', label: 'Proje Günlüğü' },
  { to: '/hizmetler', label: 'Hizmetler' },
  { to: '/iletisim', label: 'İletişim' },
]

function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const location = useLocation()

  useEffect(() => setIsOpen(false), [location.pathname])

  return (
    <header className="site-header">
      <nav className="navbar" aria-label="Ana navigasyon">
        <Link className="logo" to="/" aria-label="Ana sayfaya git">
          <span className="logo-mark" aria-hidden="true">YBİ</span>
          <span>Yavuz Bahadır İnci</span>
        </Link>

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
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => (isActive ? 'active' : undefined)}
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      </nav>
    </header>
  )
}

export default Navbar
