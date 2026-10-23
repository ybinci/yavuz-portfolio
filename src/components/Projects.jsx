import { useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { usePublicContent } from '../context/publicContentContext.js'
import ProjectCard from './ProjectCard'
import ProjectDetail from './ProjectDetail'

function Projects() {
  const { projects: projectList, isLoading } = usePublicContent()
  const navigate = useNavigate()
  const { slug } = useParams()
  const selectedProject = useMemo(
    () => projectList.find((project) => project.slug === slug) ?? null,
    [projectList, slug],
  )

  const closeProject = () => {
    navigate('/projeler')
  }

  return (
    <section
      className={`page-panel section projects-page ${slug ? 'has-detail' : ''}`}
      aria-labelledby={slug ? 'project-detail-title' : 'projects-title'}
    >
      {slug && selectedProject ? (
        <ProjectDetail project={selectedProject} onBack={closeProject} />
      ) : slug && isLoading ? (
        <div className="project-route-message">
          <p className="eyebrow">Projeler</p>
          <h1 id="project-detail-title">Proje yükleniyor</h1>
          <p>Proje detayları hazırlanıyor...</p>
        </div>
      ) : slug ? (
        <div className="project-route-message">
          <p className="eyebrow">Projeler</p>
          <h1 id="project-detail-title">Proje bulunamadı</h1>
          <p>Bu slug ile eşleşen bir proje bulunamadı.</p>
          <button className="button button-primary" type="button" onClick={closeProject}>
            Projelere dön
          </button>
        </div>
      ) : (
        <>
          <header className="section-heading section-heading-row">
            <div>
              <p className="eyebrow">Seçili çalışmalar</p>
              <h1 id="projects-title">Projeler</h1>
            </div>
            <p>
              Mekanik tasarım, kontrol sistemleri, FEA ve CFD alanlarında yürüttüğüm
              seçili proje çalışmalarım.
            </p>
          </header>

          <div className="project-pdf-action">
            <a
              className="button button-primary"
              href="/portfolio.pdf"
              target="_blank"
              rel="noreferrer"
            >
              Portföy PDF Görüntüle <span aria-hidden="true">↗</span>
            </a>
          </div>

          {isLoading && <p className="project-loading">Projeler yükleniyor...</p>}

          <div className="project-grid">
            {projectList.map((project, index) => (
              <ProjectCard
                key={project.slug}
                project={project}
                index={index}
              />
            ))}
          </div>
        </>
      )}
    </section>
  )
}

export default Projects
