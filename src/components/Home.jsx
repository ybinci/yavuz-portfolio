function Home({ onNavigate }) {
  return (
    <section className="hero page-panel" aria-labelledby="home-title">
      <div className="hero-copy">
        <p className="eyebrow">Makine Mühendisliği Öğrencisi</p>
        <h1 id="home-title">Yavuz Bahadır İnci</h1>
        <p className="subtitle">
          Mekanik tasarım, analiz, simülasyon ve kontrol sistemleri alanlarında kendimi
          geliştiriyorum. Derslerde öğrendiğim teorik bilgileri proje, modelleme ve
          prototip çalışmalarıyla uygulamaya dönüştürmeye çalışıyorum.
        </p>

        <div className="hero-actions">
          <button className="button button-primary" onClick={() => onNavigate('projects')}>
            Projelerimi Gör <span aria-hidden="true">→</span>
          </button>
          <button className="button button-outline" onClick={() => onNavigate('services')}>
            Hizmetler
          </button>
        </div>
      </div>

      <div className="hero-visual">
        <div className="profile-frame">
          <img src="/profile.png" alt="Yavuz Bahadır İnci" className="profile-photo" />
        </div>
        <div className="hero-badge">
          <span className="status-dot" aria-hidden="true" />
          Tasarım · Analiz · Prototipleme
        </div>
      </div>
    </section>
  )
}

export default Home
