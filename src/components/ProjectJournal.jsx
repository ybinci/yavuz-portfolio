import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { usePublicContent } from '../context/publicContentContext.js'
import { itemPath } from '../lib/seo.js'

function renderContent(content) {
  return content
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
}

function ProjectJournal() {
  const { slug } = useParams()
  const { journal: entries, isLoading } = usePublicContent()
  const selectedEntry = useMemo(
    () => entries.find((entry) => entry.slug === slug || String(entry.id) === slug),
    [entries, slug],
  )

  if (slug && selectedEntry) {
    const contentParagraphs = renderContent(selectedEntry.content || selectedEntry.summary || '')

    return (
      <section className="page-panel section journal-page" aria-labelledby="journal-detail-title">
        <Link className="project-back journal-back" to="/proje-gunlugu">
          <span aria-hidden="true">←</span> Günlüğe dön
        </Link>
        <article className="journal-detail">
          <p className="eyebrow">{selectedEntry.date ?? 'Proje günlüğü'}</p>
          <h1 id="journal-detail-title">{selectedEntry.title}</h1>
          {selectedEntry.projectName && (
            <p className="journal-project-name">{selectedEntry.projectName}</p>
          )}
          {contentParagraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
          {selectedEntry.images.length > 0 && (
            <section className="journal-gallery-section" aria-labelledby="journal-gallery-title">
              <h2 id="journal-gallery-title">Günlük görselleri</h2>
              <div className="journal-gallery">
                {selectedEntry.images.map((image, index) => (
                  <figure key={`${image}-${index}`}>
                    <img
                      src={image}
                      alt={`${selectedEntry.title} — görsel ${index + 1}`}
                      loading="lazy"
                    />
                  </figure>
                ))}
              </div>
            </section>
          )}
          {selectedEntry.tags.length > 0 && (
            <ul className="journal-tags" aria-label="Etiketler">
              {selectedEntry.tags.map((tag) => <li key={tag}>{tag}</li>)}
            </ul>
          )}
          {(selectedEntry.pdfUrl || selectedEntry.relatedProjectSlug) && (
            <div className="project-detail-actions" aria-label="Günlük bağlantıları">
              {selectedEntry.pdfUrl && (
                <a
                  className="button button-primary"
                  href={selectedEntry.pdfUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  Araştırma Raporunu Görüntüle (PDF) <span aria-hidden="true">↗</span>
                </a>
              )}
              {selectedEntry.relatedProjectSlug && (
                <Link
                  className="button button-primary"
                  to={`/projeler/${selectedEntry.relatedProjectSlug}`}
                >
                  İlgili projeyi gör <span aria-hidden="true">↗</span>
                </Link>
              )}
            </div>
          )}
        </article>
      </section>
    )
  }

  if (slug && isLoading) {
    return (
      <section className="page-panel section journal-page" aria-labelledby="journal-detail-title">
        <div className="project-route-message">
          <p className="eyebrow">Proje günlüğü</p>
          <h1 id="journal-detail-title">Günlük kaydı yükleniyor</h1>
          <p>Proje günlüğü detayı hazırlanıyor...</p>
        </div>
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
          Rüzgâr türbini analizleri, CFD, OpenFAST, URANS ve rotor aerodinamiği üzerine
          araştırma notları, deneme çıktıları ve proje ilerleme kayıtları.
        </p>
      </header>

      {isLoading && <p className="project-loading">Günlük yazıları yükleniyor...</p>}

      {entries.length > 0 ? (
        <div className="project-grid">
          {entries.map((entry, index) => (
            <Link
              key={entry.slug}
              className="project-card journal-card"
              to={itemPath('/proje-gunlugu', entry)}
            >
              {entry.images.length > 0 && (
                <img
                  className="journal-card-cover"
                  src={entry.images[0]}
                  alt={`${entry.title} kapak görseli`}
                  loading="lazy"
                />
              )}
              <span className="project-number">{String(index + 1).padStart(2, '0')}</span>
              <div className="project-content">
                <div className="project-card-meta">
                  <span className="project-category">{entry.date ?? 'Günlük'}</span>
                  {entry.status && <span className="project-status">{entry.status}</span>}
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
            Bu alan Supabase project_journal tablosundan published yazıları gösterecek
            şekilde hazırlandı. Veri yoksa site boş state ile güvenli çalışır.
          </p>
        </div>
      )}
    </section>
  )
}

export default ProjectJournal
