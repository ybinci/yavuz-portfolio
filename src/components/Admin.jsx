import { useMemo, useState } from 'react'
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

function Admin() {
  const [credentials, setCredentials] = useState({ username: '', password: '' })
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loginMessage, setLoginMessage] = useState('')
  const [projectForm, setProjectForm] = useState(initialProjectForm)
  const [previewProject, setPreviewProject] = useState(null)
  const [submitStatus, setSubmitStatus] = useState({ type: '', message: '' })
  const [isSaving, setIsSaving] = useState(false)

  const generatedProject = useMemo(() => ({
    slug: projectForm.slug,
    title: projectForm.title,
    category: projectForm.category,
    summary: projectForm.summary,
    description: projectForm.description,
    role: projectForm.role,
    tools: splitListField(projectForm.tools),
    images: splitListField(projectForm.images),
    pdf_url: projectForm.pdfUrl || null,
    portfolio_url: projectForm.portfolioUrl || null,
    github_url: projectForm.githubUrl || null,
    status: projectForm.status,
  }), [projectForm])

  const updateCredentials = (event) => {
    const { name, value } = event.target
    setCredentials((current) => ({ ...current, [name]: value }))
  }

  const updateProjectForm = (event) => {
    const { name, value } = event.target
    setProjectForm((current) => ({ ...current, [name]: value }))
  }

  const handleLogin = (event) => {
    event.preventDefault()

    // temporary demo auth: Bu kontrol sadece admin panel UI taslağı içindir.
    if (credentials.username === 'admin' && credentials.password === 'demo123') {
      setIsAuthenticated(true)
      setLoginMessage('')
      return
    }

    setLoginMessage('Demo giriş için kullanıcı adı admin, şifre demo123 olarak ayarlandı.')
  }

  const handleProjectSubmit = async (event) => {
    event.preventDefault()
    setPreviewProject(generatedProject)
    setSubmitStatus({ type: '', message: '' })

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
        .insert([generatedProject])

      if (error) throw error

      setSubmitStatus({
        type: 'success',
        message: 'Proje Supabase projects tablosuna başarıyla kaydedildi.',
      })
    } catch (error) {
      setSubmitStatus({
        type: 'error',
        message: `Kayıt sırasında hata oluştu: ${error.message}`,
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <section className="page-panel admin-page" aria-labelledby="admin-title">
      {!isAuthenticated ? (
        <div className="admin-login-card">
          <p className="eyebrow">Admin panel taslağı</p>
          <h1 id="admin-title">Proje yönetimi</h1>
          <p>
            Bu ekran şimdilik demo giriş ile çalışır. Proje ekleme formu Supabase
            bağlantısı hazır olduğunda doğrudan projects tablosuna kayıt gönderir.
          </p>

          <form className="admin-login-form" onSubmit={handleLogin}>
            <label>
              Kullanıcı adı
              <input
                name="username"
                type="text"
                value={credentials.username}
                onChange={updateCredentials}
                placeholder="admin"
                autoComplete="username"
              />
            </label>
            <label>
              Şifre
              <input
                name="password"
                type="password"
                value={credentials.password}
                onChange={updateCredentials}
                placeholder="demo123"
                autoComplete="current-password"
              />
            </label>
            {loginMessage && <p className="admin-message">{loginMessage}</p>}
            <button className="button button-primary" type="submit">Giriş yap</button>
          </form>
        </div>
      ) : (
        <div className="admin-workspace">
          <header className="admin-heading">
            <div>
              <p className="eyebrow">Supabase projects tablosu</p>
              <h1 id="admin-title">Yeni Proje Ekle</h1>
            </div>
            <p>
              Form gönderildiğinde alanlar Supabase şemasına uygun objeye dönüştürülür.
              `tools` ve `images` değerleri virgül veya satır bazlı ayrıştırılarak array
              olarak kaydedilir.
            </p>
          </header>

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
                  <option value="draft">draft</option>
                  <option value="published">published</option>
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
                  {isSaving ? 'Kaydediliyor...' : 'Supabase’e kaydet'}
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
              <p className="eyebrow">JSON önizleme</p>
              <h2>Supabase’e gönderilecek veri</h2>
              <pre>
                {JSON.stringify(previewProject ?? generatedProject, null, 2)}
              </pre>
            </aside>
          </div>
        </div>
      )}
    </section>
  )
}

export default Admin
