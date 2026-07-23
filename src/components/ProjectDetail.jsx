function ProjectDetail({ project, onBack }) {
  const projectImages = Array.isArray(project.images) ? project.images : []
  const projectTools = Array.isArray(project.tools) ? project.tools : []
  const projectLinks = [
    { label: 'PDF Görüntüle', url: project.pdfUrl },
    { label: 'Portföy Bağlantısı', url: project.portfolioUrl },
    { label: 'GitHub', url: project.githubUrl },
  ].filter((link) => Boolean(link.url))

  return (
    <article className="project-detail" aria-labelledby="project-detail-title">
      <button className="project-back" type="button" onClick={onBack}>
        <span aria-hidden="true">←</span> Projelere dön
      </button>

      <header className="project-detail-hero">
        <div>
          <span className="project-detail-category">{project.category}</span>
          <h1 id="project-detail-title">{project.title}</h1>
          {project.status && <span className="project-detail-status">{project.status}</span>}
        </div>
        <p>{project.summary}</p>
      </header>

      <div className="project-detail-body">
        <section className="project-description" aria-labelledby="description-title">
          <p className="eyebrow">Proje hakkında</p>
          <h2 id="description-title">Problemi tasarımla çözmek</h2>
          <p>{project.description}</p>

          {projectLinks.length > 0 && (
            <div className="project-detail-actions" aria-label="Proje bağlantıları">
              {projectLinks.map((link) => (
                <a
                  key={link.label}
                  className="button button-primary"
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  {link.label} <span aria-hidden="true">↗</span>
                </a>
              ))}
            </div>
          )}
        </section>

        <aside className="project-meta">
          <div>
            <span>Benim rolüm</span>
            <p>{project.role}</p>
          </div>
          <div>
            <span>Araçlar / teknolojiler</span>
            <ul>
              {projectTools.map((tool) => <li key={tool}>{tool}</li>)}
            </ul>
          </div>
        </aside>
      </div>

      {projectImages.length > 0 && (
        <section className="project-gallery-section" aria-labelledby="gallery-title">
          <div className="project-gallery-heading">
            <p className="eyebrow">Proje galerisi</p>
            <h2 id="gallery-title">
              {project.galleryTitle ?? 'Tasarım ve analiz çıktıları'}
            </h2>
          </div>
          <div className="project-detail-gallery">
            {projectImages.map((image, index) => (
              <figure key={image}>
                <img
                  src={image}
                  alt={`${project.title} proje görseli ${index + 1}`}
                  loading="lazy"
                />
              </figure>
            ))}
          </div>
        </section>
      )}
    </article>
  )
}

export default ProjectDetail
