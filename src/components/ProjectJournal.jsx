import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { isSupabaseConfigured, supabase } from '../lib/supabaseClient'
import { projectJournalEntries as fallbackJournalEntries } from '../data/projectJournal'

const staticJournalEntries = fallbackJournalEntries.map(normalizeJournalEntry)

function toArray(value) {
  if (Array.isArray(value)) return value
  if (typeof value === 'string') {
    return value
      .split(/[\n,]+/)
      .map((item) => item.trim())
      .filter(Boolean)
  }

  return []
}

function getEntrySlug(entry) {
  return typeof entry.slug === 'string' ? entry.slug.trim() : ''
}

function normalizeJournalEntry(entry) {
  return {
    id: entry.id ?? entry.slug,
    title: entry.title,
    slug: entry.slug,
    projectName: entry.project_name ?? entry.projectName ?? '',
    date: entry.date ?? null,
    summary: entry.summary,
    content: entry.content ?? entry.description ?? '',
    tags: toArray(entry.tags),
    relatedProjectSlug: entry.related_project_slug ?? entry.relatedProjectSlug ?? null,
    status: entry.status,
    createdAt: entry.created_at ?? entry.createdAt ?? null,
  }
}

function getEntryDateValue(entry) {
  const sourceDate = entry.date ?? entry.createdAt
  const timestamp = sourceDate ? new Date(sourceDate).getTime() : 0

  return Number.isNaN(timestamp) ? 0 : timestamp
}

function sortNewestFirst(entries) {
  return [...entries].sort((firstEntry, secondEntry) => (
    getEntryDateValue(secondEntry) - getEntryDateValue(firstEntry)
  ))
}

function uniqueEntriesBySlug(entries) {
  const usedSlugs = new Set()

  return entries.filter((entry) => {
    const slug = getEntrySlug(entry)

    if (!slug || usedSlugs.has(slug)) return false

    usedSlugs.add(slug)
    return true
  })
}

function mergeJournalEntries(staticEntries, supabaseEntries) {
  const sortedSupabaseEntries = uniqueEntriesBySlug(sortNewestFirst(supabaseEntries))
  const staticEntriesWithoutDuplicates = staticEntries.filter((staticEntry) => (
    !sortedSupabaseEntries.some((supabaseEntry) => (
      getEntrySlug(staticEntry) === getEntrySlug(supabaseEntry)
    ))
  ))

  return [...sortedSupabaseEntries, ...staticEntriesWithoutDuplicates]
}

function renderContent(content) {
  return content
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
}

function ProjectJournal() {
  const { slug } = useParams()
  const [entries, setEntries] = useState(staticJournalEntries)
  const [isLoading, setIsLoading] = useState(isSupabaseConfigured)
  const selectedEntry = useMemo(
    () => entries.find((entry) => entry.slug === slug || String(entry.id) === slug),
    [entries, slug],
  )

  useEffect(() => {
    let isMounted = true

    async function loadJournalEntries() {
      if (!isSupabaseConfigured || !supabase) {
        setEntries(staticJournalEntries)
        setIsLoading(false)
        return
      }

      try {
        const { data, error } = await supabase
          .from('project_journal')
          .select('*')
          .eq('status', 'published')
          .order('date', { ascending: false })

        if (error) throw error

        if (isMounted) {
          const publishedEntries = Array.isArray(data)
            ? data.map(normalizeJournalEntry).filter((entry) => getEntrySlug(entry))
            : []

          setEntries(mergeJournalEntries(staticJournalEntries, publishedEntries))
          setIsLoading(false)
        }
      } catch (error) {
        console.warn('Supabase project_journal fallback:', error)
        if (isMounted) {
          setEntries(staticJournalEntries)
          setIsLoading(false)
        }
      }
    }

    loadJournalEntries()

    return () => {
      isMounted = false
    }
  }, [])

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
          {selectedEntry.tags.length > 0 && (
            <ul className="journal-tags" aria-label="Etiketler">
              {selectedEntry.tags.map((tag) => <li key={tag}>{tag}</li>)}
            </ul>
          )}
          {selectedEntry.relatedProjectSlug && (
            <Link
              className="button button-primary"
              to={`/projeler/${selectedEntry.relatedProjectSlug}`}
            >
              İlgili projeyi gör <span aria-hidden="true">↗</span>
            </Link>
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
          Geliştirme notları, deneme çıktıları ve proje ilerleme kayıtları bu bölümde
          listelenecek.
        </p>
      </header>

      {isLoading && <p className="project-loading">Günlük yazıları yükleniyor...</p>}

      {entries.length > 0 ? (
        <div className="project-grid">
          {entries.map((entry, index) => (
            <Link
              key={entry.slug}
              className="project-card journal-card"
              to={`/proje-gunlugu/${entry.slug}`}
            >
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
