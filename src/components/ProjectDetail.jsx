function ProjectDetail({ project, onBack }) {
  return (
    <article className="project-detail" aria-labelledby="project-detail-title">
      <button className="project-back" type="button" onClick={onBack}>
        <span aria-hidden="true">←</span> Projelere dön
      </button>

      <header className="project-detail-hero">
        <div>
          <span className="project-detail-category">{project.category}</span>
          <h1 id="project-detail-title">{project.title}</h1>
        </div>
        <p>{project.summary}</p>
      </header>

      <div className="project-detail-body">
        <section className="project-description" aria-labelledby="description-title">
          <p className="eyebrow">Proje hakkında</p>
          <h2 id="description-title">Problemi tasarımla çözmek</h2>
          <p>{project.description}</p>
        </section>

        <aside className="project-meta">
          <div>
            <span>Benim rolüm</span>
            <p>{project.role}</p>
          </div>
          <div>
            <span>Araçlar / teknolojiler</span>
            <ul>
              {project.tools.map((tool) => <li key={tool}>{tool}</li>)}
            </ul>
          </div>
        </aside>
      </div>

      {project.images.length > 0 && (
        <section className="project-gallery-section" aria-labelledby="gallery-title">
          <div className="project-gallery-heading">
            <p className="eyebrow">Proje galerisi</p>
            <h2 id="gallery-title">
              {project.galleryTitle ?? 'Tasarım ve analiz çıktıları'}
            </h2>
          </div>
          <div className="project-detail-gallery">
            {project.images.map((image, index) => (
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
