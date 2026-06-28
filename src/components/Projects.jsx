import { useMemo, useState } from 'react'
import { projects } from '../data/projects'
import ProjectCard from './ProjectCard'
import ProjectDetail from './ProjectDetail'

const projectHashPrefix = '#project-'

function getInitialProjectSlug() {
  if (!window.location.hash.startsWith(projectHashPrefix)) return null

  const slug = window.location.hash.slice(projectHashPrefix.length)
  return projects.some((project) => project.slug === slug) ? slug : null
}

function Projects() {
  const [selectedSlug, setSelectedSlug] = useState(getInitialProjectSlug)
  const selectedProject = useMemo(
    () => projects.find((project) => project.slug === selectedSlug) ?? null,
    [selectedSlug],
  )

  const selectProject = (slug) => {
    setSelectedSlug(slug)
    window.history.replaceState(null, '', `${projectHashPrefix}${slug}`)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const closeProject = () => {
    setSelectedSlug(null)
    window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}`)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <section
      className={`page-panel section projects-page ${selectedProject ? 'has-detail' : ''}`}
      aria-labelledby={selectedProject ? 'project-detail-title' : 'projects-title'}
    >
      {selectedProject ? (
        <ProjectDetail project={selectedProject} onBack={closeProject} />
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

          <div className="project-grid">
            {projects.map((project, index) => (
              <ProjectCard
                key={project.slug}
                project={project}
                index={index}
                onSelect={selectProject}
              />
            ))}
          </div>
        </>
      )}
    </section>
  )
}

export default Projects
