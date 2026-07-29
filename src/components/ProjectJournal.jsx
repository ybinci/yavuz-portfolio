import { Link, useParams } from 'react-router-dom'
import { projectJournalEntries } from '../data/projectJournal'

function ProjectJournal() {
  const { slug } = useParams()
  const selectedEntry = projectJournalEntries.find((entry) => (
    entry.slug === slug || String(entry.id) === slug
  ))

  if (slug && selectedEntry) {
    return (
      <section className="page-panel section journal-page" aria-labelledby="journal-detail-title">
        <Link className="project-back journal-back" to="/proje-gunlugu">
          <span aria-hidden="true">←</span> Günlüğe dön
        </Link>
        <article className="journal-detail">
          <p className="eyebrow">{selectedEntry.date ?? 'Proje günlüğü'}</p>
          <h1 id="journal-detail-title">{selectedEntry.title}</h1>
          <p>{selectedEntry.description}</p>
        </article>
      </section>
    )
  }

  if (slug) {
    return (
      <section className="page-panel section journal-page" aria-labelledby="journal-detail-title">
        <div className="project-route-message">
          <p className="eyebrow">Proje günlüğü</p>
          <h1 id="journal-detail-title">Günlük kaydı bulunamadı</h1>
          <p>Bu bağlantıyla eşleşen bir proje günlüğü kaydı yok.</p>
          <Link className="button button-primary" to="/proje-gunlugu">
            Günlüğe dön
          </Link>
        </div>
      </section>
    )
  }

  return (
    <section className="page-panel section journal-page" aria-labelledby="journal-title">
      <header className="section-heading section-heading-row">
        <div>
          <p className="eyebrow">Proje süreci</p>
          <h1 id="journal-title">Proje Günlüğü</h1>
        </div>
        <p>
          Geliştirme notları, deneme çıktıları ve proje ilerleme kayıtları bu bölümde
          listelenecek.
        </p>
      </header>

      {projectJournalEntries.length > 0 ? (
        <div className="project-grid">
          {projectJournalEntries.map((entry, index) => (
            <Link
              key={entry.id ?? entry.slug}
              className="project-card journal-card"
              to={`/proje-gunlugu/${entry.slug ?? entry.id}`}
            >
              <span className="project-number">{String(index + 1).padStart(2, '0')}</span>
              <div className="project-content">
                <div className="project-card-meta">
                  <span className="project-category">{entry.date ?? 'Günlük'}</span>
                </div>
                <h2>{entry.title}</h2>
                <p>{entry.summary}</p>
                <span className="project-card-action">Kaydı incele</span>
              </div>
              <span className="project-arrow" aria-hidden="true">↗</span>
            </Link>
          ))}
        </div>
      ) : (
        <div className="journal-empty">
          <p className="eyebrow">Yakında</p>
          <h2>Proje günlüğü kayıtları hazırlanıyor.</h2>
          <p>
            Bu alan route yapısı hazır olacak şekilde eklendi; yeni günlük kayıtları
            eklendiğinde liste ve detay sayfaları aynı URL mantığıyla çalışacak.
          </p>
        </div>
      )}
    </section>
  )
}

export default ProjectJournal
