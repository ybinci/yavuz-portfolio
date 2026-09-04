import { useEffect, useMemo, useState } from 'react'
import {
  hasSupabaseConfig,
  supabase,
  supabaseConfigErrorMessage,
} from '../lib/supabaseClient'

const initialProjectForm = {
  title: '',
  slug: '',
  category: '',
  summary: '',
  description: '',
  role: '',
  tools: '',
  images: '',
  pdfUrl: '',
  portfolioUrl: '',
  githubUrl: '',
  status: 'draft',
}

const initialJournalForm = {
  title: '',
  slug: '',
  projectName: '',
  date: '',
  summary: '',
  content: '',
  tags: '',
  relatedProjectSlug: '',
  status: 'draft',
}

const splitListField = (value) => (
  value
    .split(/[\n,]+/)
    .map((item) => item.trim())
    .filter(Boolean)
)

function createProjectPayload(projectForm) {
  return {
    slug: projectForm.slug.trim(),
    title: projectForm.title.trim(),
    category: projectForm.category.trim(),
    summary: projectForm.summary.trim(),
    description: projectForm.description.trim(),
    role: projectForm.role.trim(),
    tools: splitListField(projectForm.tools),
    images: splitListField(projectForm.images),
    pdf_url: projectForm.pdfUrl.trim() || null,
    portfolio_url: projectForm.portfolioUrl.trim() || null,
    github_url: projectForm.githubUrl.trim() || null,
    status: projectForm.status,
  }
}

function createJournalPayload(journalForm) {
  return {
    title: journalForm.title.trim(),
    slug: journalForm.slug.trim(),
    project_name: journalForm.projectName.trim(),
    date: journalForm.date || null,
    summary: journalForm.summary.trim(),
    content: journalForm.content.trim(),
    tags: splitListField(journalForm.tags),
    related_project_slug: journalForm.relatedProjectSlug.trim() || null,
    status: journalForm.status,
  }
}

function getSupabaseErrorMessage(error) {
  const errorMessage = error?.message ?? ''

  if (errorMessage.toLowerCase().includes('failed to fetch')) {
    return 'Supabase bağlantısı kurulamadı. URL, anon key veya Supabase erişim ayarlarını kontrol edin.'
  }

  return errorMessage || 'Supabase işlemi sırasında bilinmeyen bir hata oluştu.'
}

function Admin() {
  const [authForm, setAuthForm] = useState({ email: '', password: '' })
  const [session, setSession] = useState(null)
  const [isAuthLoading, setIsAuthLoading] = useState(false)
  const [authMessage, setAuthMessage] = useState({ type: '', message: '' })
  const [activeSection, setActiveSection] = useState('projects')
  const [projectForm, setProjectForm] = useState(initialProjectForm)
  const [journalForm, setJournalForm] = useState(initialJournalForm)
  const [previewProject, setPreviewProject] = useState(null)
  const [previewJournal, setPreviewJournal] = useState(null)
  const [projectSubmitStatus, setProjectSubmitStatus] = useState({ type: '', message: '' })
  const [journalSubmitStatus, setJournalSubmitStatus] = useState({ type: '', message: '' })
  const [isSavingProject, setIsSavingProject] = useState(false)
  const [isSavingJournal, setIsSavingJournal] = useState(false)

  const isAuthenticated = Boolean(session?.user)
  const isLoginDisabled = (
    isAuthLoading
    || !authForm.email.trim()
    || !authForm.password.trim()
  )
  const livePreviewProject = useMemo(() => createProjectPayload(projectForm), [projectForm])
  const livePreviewJournal = useMemo(() => createJournalPayload(journalForm), [journalForm])

  useEffect(() => {
    if (!hasSupabaseConfig || !supabase) {
      setAuthMessage({
        type: 'error',
        message: supabaseConfigErrorMessage,
      })
      return undefined
    }

    let isMounted = true

    supabase.auth.getSession().then(({ data, error }) => {
      if (!isMounted) return

      if (error) {
        setAuthMessage({ type: 'error', message: getSupabaseErrorMessage(error) })
      }

      setSession(data.session)
    })

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)

      if (!nextSession) {
        setProjectForm(initialProjectForm)
        setJournalForm(initialJournalForm)
        setPreviewProject(null)
        setPreviewJournal(null)
        setProjectSubmitStatus({ type: '', message: '' })
        setJournalSubmitStatus({ type: '', message: '' })
      }
    })

    return () => {
      isMounted = false
      authListener.subscription.unsubscribe()
    }
  }, [])

  const updateAuthForm = (event) => {
    const { name, value } = event.target
    setAuthForm((current) => ({ ...current, [name]: value }))
  }

  const updateProjectForm = (event) => {
    const { name, value } = event.target
    setProjectForm((current) => ({ ...current, [name]: value }))
  }

  const updateJournalForm = (event) => {
    const { name, value } = event.target
    setJournalForm((current) => ({ ...current, [name]: value }))
  }

  const handleLogin = async (event) => {
    event.preventDefault()
    console.log('Login attempt started')
    setAuthMessage({ type: '', message: '' })

    if (!hasSupabaseConfig || !supabase) {
      setAuthMessage({
        type: 'error',
        message: supabaseConfigErrorMessage,
      })
      return
    }

    setIsAuthLoading(true)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: authForm.email.trim(),
        password: authForm.password,
      })

      if (error) throw error

      if (data.session) {
        setSession(data.session)
      }

      setAuthForm((current) => ({ ...current, password: '' }))
      setAuthMessage({ type: 'success', message: 'Giriş başarılı.' })
    } catch (error) {
      setAuthMessage({
        type: 'error',
        message: `Giriş yapılamadı: ${getSupabaseErrorMessage(error)}`,
      })
    } finally {
      setIsAuthLoading(false)
    }
  }

  const handleLogout = async () => {
    if (!hasSupabaseConfig || !supabase) return

    setIsAuthLoading(true)

    try {
      const { error } = await supabase.auth.signOut()

      if (error) throw error

      setAuthForm({ email: '', password: '' })
      setAuthMessage({ type: 'success', message: 'Çıkış yapıldı.' })
    } catch (error) {
      setAuthMessage({ type: 'error', message: getSupabaseErrorMessage(error) })
    } finally {
      setIsAuthLoading(false)
    }
  }

  const handleProjectSubmit = async (event) => {
    event.preventDefault()

    const projectPayload = createProjectPayload(projectForm)
    setPreviewProject(projectPayload)
    setProjectSubmitStatus({ type: '', message: '' })

    if (!isAuthenticated) {
      setProjectSubmitStatus({
        type: 'error',
        message: 'Proje kaydetmek için Supabase Auth ile giriş yapmalısınız.',
      })
      return
    }

    if (!hasSupabaseConfig || !supabase) {
      setProjectSubmitStatus({
        type: 'error',
        message: supabaseConfigErrorMessage,
      })
      return
    }

    setIsSavingProject(true)

    try {
      const { error } = await supabase
        .from('projects')
        .insert([projectPayload])

      if (error) throw error

      setProjectSubmitStatus({
        type: 'success',
        message: 'Proje başarıyla kaydedildi.',
      })
      setProjectForm(initialProjectForm)
      setPreviewProject(projectPayload)
    } catch (error) {
      setProjectSubmitStatus({
        type: 'error',
        message: getSupabaseErrorMessage(error),
      })
    } finally {
      setIsSavingProject(false)
    }
  }

  const handleJournalSubmit = async (event) => {
    event.preventDefault()

    const journalPayload = createJournalPayload(journalForm)
    setPreviewJournal(journalPayload)
    setJournalSubmitStatus({ type: '', message: '' })

    if (!isAuthenticated) {
      setJournalSubmitStatus({
        type: 'error',
        message: 'Günlük yazısı kaydetmek için Supabase Auth ile giriş yapmalısınız.',
      })
      return
    }

    if (!hasSupabaseConfig || !supabase) {
      setJournalSubmitStatus({
        type: 'error',
        message: supabaseConfigErrorMessage,
      })
      return
    }

    setIsSavingJournal(true)

    try {
      const { error } = await supabase
        .from('project_journal')
        .insert([journalPayload])

      if (error) throw error

      setJournalSubmitStatus({
        type: 'success',
        message: 'Günlük yazısı başarıyla kaydedildi.',
      })
      setJournalForm(initialJournalForm)
      setPreviewJournal(journalPayload)
    } catch (error) {
      setJournalSubmitStatus({
        type: 'error',
        message: getSupabaseErrorMessage(error),
      })
    } finally {
      setIsSavingJournal(false)
    }
  }

  return (
    <section className="page-panel admin-page" aria-labelledby="admin-title">
      {!isAuthenticated ? (
        <div className="admin-login-card">
          <p className="eyebrow">Supabase Auth</p>
          <h1 id="admin-title">Admin girişi</h1>
          <p>
            Proje ve günlük yönetimine erişmek için Supabase Auth üzerinde tanımlı admin
            hesabınızla giriş yapın.
          </p>

          <form className="admin-login-form" onSubmit={handleLogin}>
            <label>
              E-posta
              <input
                name="email"
                type="email"
                value={authForm.email}
                onChange={updateAuthForm}
                placeholder="admin@example.com"
                autoComplete="email"
              />
            </label>
            <label>
              Şifre
              <input
                name="password"
                type="password"
                value={authForm.password}
                onChange={updateAuthForm}
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </label>
            {authMessage.message && (
              <p className={`admin-submit-message ${authMessage.type}`}>
                {authMessage.message}
              </p>
            )}
            <div className="admin-form-actions">
              <button
                className="button button-primary"
                type="submit"
                disabled={isLoginDisabled}
              >
                {isAuthLoading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
              </button>
              <button
                className="button button-outline"
                type="button"
                disabled
                onClick={handleLogout}
              >
                Çıkış Yap
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="admin-workspace">
          <header className="admin-heading">
            <div>
              <p className="eyebrow">Supabase yönetimi</p>
              <h1 id="admin-title">
                {activeSection === 'projects' ? 'Yeni Proje Ekle' : 'Proje Günlüğü Yönetimi'}
              </h1>
            </div>
            <div className="admin-session-card">
              <p>
                Giriş yapan kullanıcı:
                <span>{session.user.email}</span>
              </p>
              <button
                className="button button-outline"
                type="button"
                disabled={isAuthLoading}
                onClick={handleLogout}
              >
                Çıkış Yap
              </button>
            </div>
          </header>

          <div className="admin-section-tabs" aria-label="Admin bölümleri">
            <button
              className={activeSection === 'projects' ? 'active' : ''}
              type="button"
              onClick={() => setActiveSection('projects')}
            >
              Proje Ekle
            </button>
            <button
              className={activeSection === 'journal' ? 'active' : ''}
              type="button"
              onClick={() => setActiveSection('journal')}
            >
              Proje Günlüğü Yazısı Ekle
            </button>
          </div>

          {activeSection === 'projects' ? (
            <>
              <p className="admin-helper-text">
                Form gönderildiğinde alanlar Supabase projects tablosuna uygun objeye
                dönüştürülür. Tools ve images değerleri virgül veya satır bazlı ayrıştırılarak
                array olarak kaydedilir.
              </p>

              <div className="admin-grid">
                <form className="admin-project-form" onSubmit={handleProjectSubmit}>
                  <label>
                    Proje başlığı
                    <input
                      name="title"
                      type="text"
                      value={projectForm.title}
                      onChange={updateProjectForm}
                      placeholder="Örn. Yeni Mekanik Tasarım Projesi"
                    />
                  </label>
                  <label>
                    Slug
                    <input
                      name="slug"
                      type="text"
                      value={projectForm.slug}
                      onChange={updateProjectForm}
                      placeholder="yeni-mekanik-tasarim-projesi"
                    />
                  </label>
                  <label>
                    Kategori
                    <input
                      name="category"
                      type="text"
                      value={projectForm.category}
                      onChange={updateProjectForm}
                      placeholder="CAD · Mekanik Tasarım"
                    />
                  </label>
                  <label>
                    Durum
                    <select name="status" value={projectForm.status} onChange={updateProjectForm}>
                      <option value="published">published</option>
                      <option value="draft">draft</option>
                    </select>
                  </label>
                  <label className="admin-field-wide">
                    Kısa açıklama
                    <textarea
                      name="summary"
                      value={projectForm.summary}
                      onChange={updateProjectForm}
                      placeholder="Kartlarda görünecek kısa proje özeti"
                      rows="3"
                    />
                  </label>
                  <label className="admin-field-wide">
                    Detaylı açıklama
                    <textarea
                      name="description"
                      value={projectForm.description}
                      onChange={updateProjectForm}
                      placeholder="Detay ekranında gösterilecek proje açıklaması"
                      rows="6"
                    />
                  </label>
                  <label className="admin-field-wide">
                    Benim rolüm
                    <textarea
                      name="role"
                      value={projectForm.role}
                      onChange={updateProjectForm}
                      placeholder="Projede üstlenilen sorumluluklar"
                      rows="4"
                    />
                  </label>
                  <label>
                    Kullanılan araçlar / teknolojiler
                    <textarea
                      name="tools"
                      value={projectForm.tools}
                      onChange={updateProjectForm}
                      placeholder="Fusion 360, SolidWorks, ANSYS"
                      rows="5"
                    />
                  </label>
                  <label>
                    Görsel linkleri
                    <textarea
                      name="images"
                      value={projectForm.images}
                      onChange={updateProjectForm}
                      placeholder="/projects/new-project/image-1.jpg, /projects/new-project/image-2.jpg"
                      rows="5"
                    />
                  </label>
                  <label>
                    PDF linki
                    <input
                      name="pdfUrl"
                      type="text"
                      value={projectForm.pdfUrl}
                      onChange={updateProjectForm}
                      placeholder="/projects/new-project/report.pdf"
                    />
                  </label>
                  <label>
                    Portföy linki
                    <input
                      name="portfolioUrl"
                      type="text"
                      value={projectForm.portfolioUrl}
                      onChange={updateProjectForm}
                      placeholder="/portfolio.pdf"
                    />
                  </label>
                  <label>
                    GitHub linki
                    <input
                      name="githubUrl"
                      type="url"
                      value={projectForm.githubUrl}
                      onChange={updateProjectForm}
                      placeholder="https://github.com/..."
                    />
                  </label>

                  {projectSubmitStatus.message && (
                    <p className={`admin-submit-message ${projectSubmitStatus.type}`}>
                      {projectSubmitStatus.message}
                    </p>
                  )}

                  <div className="admin-form-actions">
                    <button
                      className="button button-primary"
                      type="submit"
                      disabled={isSavingProject}
                    >
                      {isSavingProject ? 'Kaydediliyor...' : 'Projeyi Kaydet'}
                    </button>
                    <button
                      className="button button-outline"
                      type="button"
                      onClick={() => {
                        setProjectForm(initialProjectForm)
                        setPreviewProject(null)
                        setProjectSubmitStatus({ type: '', message: '' })
                      }}
                    >
                      Formu temizle
                    </button>
                  </div>
                </form>

                <aside className="admin-preview" aria-live="polite">
                  <p className="eyebrow">Önizleme</p>
                  <h2>Supabase’e gönderilecek proje</h2>
                  <pre>
                    {JSON.stringify(previewProject ?? livePreviewProject, null, 2)}
                  </pre>
                </aside>
              </div>
            </>
          ) : (
            <>
              <p className="admin-helper-text">
                Bu form Supabase project_journal tablosuna günlük/blog yazısı ekler.
                Tags değeri virgül veya satır bazlı ayrıştırılarak text array olarak kaydedilir.
              </p>

              <div className="admin-grid">
                <form className="admin-project-form" onSubmit={handleJournalSubmit}>
                  <label>
                    title
                    <input
                      name="title"
                      type="text"
                      value={journalForm.title}
                      onChange={updateJournalForm}
                      placeholder="Örn. İlk prototip test notları"
                    />
                  </label>
                  <label>
                    slug
                    <input
                      name="slug"
                      type="text"
                      value={journalForm.slug}
                      onChange={updateJournalForm}
                      placeholder="ilk-prototip-test-notlari"
                    />
                  </label>
                  <label>
                    project_name
                    <input
                      name="projectName"
                      type="text"
                      value={journalForm.projectName}
                      onChange={updateJournalForm}
                      placeholder="Çift Rotorlu Dengeleme Sistemi"
                    />
                  </label>
                  <label>
                    date
                    <input
                      name="date"
                      type="date"
                      value={journalForm.date}
                      onChange={updateJournalForm}
                    />
                  </label>
                  <label className="admin-field-wide">
                    summary
                    <textarea
                      name="summary"
                      value={journalForm.summary}
                      onChange={updateJournalForm}
                      placeholder="Liste kartında görünecek kısa özet"
                      rows="3"
                    />
                  </label>
                  <label className="admin-field-wide">
                    content
                    <textarea
                      name="content"
                      value={journalForm.content}
                      onChange={updateJournalForm}
                      placeholder="Günlük yazısının detay içeriği"
                      rows="8"
                    />
                  </label>
                  <label>
                    tags
                    <textarea
                      name="tags"
                      value={journalForm.tags}
                      onChange={updateJournalForm}
                      placeholder="prototip, test, kontrol sistemi"
                      rows="5"
                    />
                  </label>
                  <label>
                    related_project_slug
                    <input
                      name="relatedProjectSlug"
                      type="text"
                      value={journalForm.relatedProjectSlug}
                      onChange={updateJournalForm}
                      placeholder="cift-rotorlu-dengeleme-sistemi"
                    />
                  </label>
                  <label>
                    status
                    <select name="status" value={journalForm.status} onChange={updateJournalForm}>
                      <option value="published">published</option>
                      <option value="draft">draft</option>
                    </select>
                  </label>

                  {journalSubmitStatus.message && (
                    <p className={`admin-submit-message ${journalSubmitStatus.type}`}>
                      {journalSubmitStatus.message}
                    </p>
                  )}

                  <div className="admin-form-actions">
                    <button
                      className="button button-primary"
                      type="submit"
                      disabled={isSavingJournal}
                    >
                      {isSavingJournal ? 'Kaydediliyor...' : 'Günlük Yazısını Kaydet'}
                    </button>
                    <button
                      className="button button-outline"
                      type="button"
                      onClick={() => {
                        setJournalForm(initialJournalForm)
                        setPreviewJournal(null)
                        setJournalSubmitStatus({ type: '', message: '' })
                      }}
                    >
                      Formu temizle
                    </button>
                  </div>
                </form>

                <aside className="admin-preview" aria-live="polite">
                  <p className="eyebrow">Önizleme</p>
                  <h2>Supabase’e gönderilecek günlük yazısı</h2>
                  <pre>
                    {JSON.stringify(previewJournal ?? livePreviewJournal, null, 2)}
                  </pre>
                </aside>
              </div>
            </>
          )}
        </div>
      )}
    </section>
  )
}

export default Admin
