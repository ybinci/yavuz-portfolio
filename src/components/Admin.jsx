import { useEffect, useMemo, useState } from 'react'
import { hasSupabaseConfig, supabase } from '../lib/supabaseClient'

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

function Admin() {
  const [authForm, setAuthForm] = useState({ email: '', password: '' })
  const [session, setSession] = useState(null)
  const [isAuthReady, setIsAuthReady] = useState(false)
  const [isAuthLoading, setIsAuthLoading] = useState(false)
  const [authMessage, setAuthMessage] = useState({ type: '', message: '' })
  const [projectForm, setProjectForm] = useState(initialProjectForm)
  const [previewProject, setPreviewProject] = useState(null)
  const [submitStatus, setSubmitStatus] = useState({ type: '', message: '' })
  const [isSaving, setIsSaving] = useState(false)

  const isAuthenticated = Boolean(session?.user)
  const livePreviewProject = useMemo(() => createProjectPayload(projectForm), [projectForm])

  useEffect(() => {
    if (!hasSupabaseConfig || !supabase) {
      setIsAuthReady(true)
      setAuthMessage({
        type: 'error',
        message:
          'Supabase bağlantısı için VITE_SUPABASE_URL ve VITE_SUPABASE_ANON_KEY env değerleri gerekli.',
      })
      return undefined
    }

    let isMounted = true

    supabase.auth.getSession().then(({ data, error }) => {
      if (!isMounted) return

      if (error) {
        setAuthMessage({ type: 'error', message: error.message })
      }

      setSession(data.session)
      setIsAuthReady(true)
    })

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)

      if (!nextSession) {
        setProjectForm(initialProjectForm)
        setPreviewProject(null)
        setSubmitStatus({ type: '', message: '' })
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

  const handleLogin = async (event) => {
    event.preventDefault()
    setAuthMessage({ type: '', message: '' })

    if (!hasSupabaseConfig || !supabase) {
      setAuthMessage({
        type: 'error',
        message:
          'Supabase bağlantısı için VITE_SUPABASE_URL ve VITE_SUPABASE_ANON_KEY env değerleri gerekli.',
      })
      return
    }

    setIsAuthLoading(true)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: authForm.email.trim(),
        password: authForm.password,
      })

      if (error) throw error

      setAuthForm((current) => ({ ...current, password: '' }))
      setAuthMessage({ type: 'success', message: 'Giriş başarılı.' })
    } catch (error) {
      setAuthMessage({ type: 'error', message: error.message })
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
      setAuthMessage({ type: 'error', message: error.message })
    } finally {
      setIsAuthLoading(false)
    }
  }

  const handleProjectSubmit = async (event) => {
    event.preventDefault()

    const projectPayload = createProjectPayload(projectForm)
    setPreviewProject(projectPayload)
    setSubmitStatus({ type: '', message: '' })

    if (!isAuthenticated) {
      setSubmitStatus({
        type: 'error',
        message: 'Proje kaydetmek için Supabase Auth ile giriş yapmalısınız.',
      })
      return
    }

    if (!hasSupabaseConfig || !supabase) {
      setSubmitStatus({
        type: 'error',
        message:
          'Supabase bağlantısı için VITE_SUPABASE_URL ve VITE_SUPABASE_ANON_KEY env değerleri gerekli.',
      })
      return
    }

    setIsSaving(true)

    try {
      const { error } = await supabase
        .from('projects')
        .insert([projectPayload])

      if (error) throw error

      setSubmitStatus({
        type: 'success',
        message: 'Proje başarıyla kaydedildi.',
      })
      setProjectForm(initialProjectForm)
      setPreviewProject(projectPayload)
    } catch (error) {
      setSubmitStatus({
        type: 'error',
        message: error.message,
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <section className="page-panel admin-page" aria-labelledby="admin-title">
      {!isAuthenticated ? (
        <div className="admin-login-card">
          <p className="eyebrow">Supabase Auth</p>
          <h1 id="admin-title">Admin girişi</h1>
          <p>
            Proje ekleme formuna erişmek için Supabase Auth üzerinde tanımlı admin
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
                disabled={isAuthLoading || !isAuthReady}
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
              <p className="eyebrow">Supabase projects tablosu</p>
              <h1 id="admin-title">Yeni Proje Ekle</h1>
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

          <p className="admin-helper-text">
            Form gönderildiğinde alanlar Supabase şemasına uygun objeye dönüştürülür.
            Tools ve images değerleri virgül veya satır bazlı ayrıştırılarak array
            olarak kaydedilir.
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

              {submitStatus.message && (
                <p className={`admin-submit-message ${submitStatus.type}`}>
                  {submitStatus.message}
                </p>
              )}

              <div className="admin-form-actions">
                <button className="button button-primary" type="submit" disabled={isSaving}>
                  {isSaving ? 'Kaydediliyor...' : 'Projeyi Kaydet'}
                </button>
                <button
                  className="button button-outline"
                  type="button"
                  onClick={() => {
                    setProjectForm(initialProjectForm)
                    setPreviewProject(null)
                    setSubmitStatus({ type: '', message: '' })
                  }}
                >
                  Formu temizle
                </button>
              </div>
            </form>

            <aside className="admin-preview" aria-live="polite">
              <p className="eyebrow">Önizleme</p>
              <h2>Supabase’e gönderilecek veri</h2>
              <pre>
                {JSON.stringify(previewProject ?? livePreviewProject, null, 2)}
              </pre>
            </aside>
          </div>
        </div>
      )}
    </section>
  )
}

export default Admin
