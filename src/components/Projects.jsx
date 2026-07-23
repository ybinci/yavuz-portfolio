import { useEffect, useMemo, useState } from 'react'
import { hasSupabaseConfig, supabase } from '../lib/supabaseClient'
import { projects as fallbackProjects } from '../data/projects'
import ProjectCard from './ProjectCard'
import ProjectDetail from './ProjectDetail'

const projectHashPrefix = '#project-'

function getInitialProjectSlug() {
  if (!window.location.hash.startsWith(projectHashPrefix)) return null

  return window.location.hash.slice(projectHashPrefix.length)
}

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

function normalizeProject(project) {
  return {
    id: project.id ?? project.slug,
    slug: project.slug,
    title: project.title,
    category: project.category,
    summary: project.summary,
    description: project.description,
    role: project.role,
    tools: toArray(project.tools),
    images: toArray(project.images),
    pdfUrl: project.pdf_url ?? project.pdfUrl ?? null,
    portfolioUrl: project.portfolio_url ?? project.portfolioUrl ?? null,
    githubUrl: project.github_url ?? project.githubUrl ?? null,
    status: project.status,
    galleryTitle: project.gallery_title ?? project.galleryTitle,
  }
}

function Projects() {
  const [projectList, setProjectList] = useState(fallbackProjects)
  const [selectedSlug, setSelectedSlug] = useState(getInitialProjectSlug)
  const [isLoading, setIsLoading] = useState(hasSupabaseConfig)
  const selectedProject = useMemo(
    () => projectList.find((project) => project.slug === selectedSlug) ?? null,
    [projectList, selectedSlug],
  )

  useEffect(() => {
    let isMounted = true

    async function loadProjects() {
      if (!hasSupabaseConfig || !supabase) {
        setProjectList(fallbackProjects)
        setIsLoading(false)
        return
      }

      try {
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .eq('status', 'published')

        if (error) throw error

        if (isMounted) {
          const publishedProjects = Array.isArray(data) ? data.map(normalizeProject) : []
          setProjectList(publishedProjects.length > 0 ? publishedProjects : fallbackProjects)
          setIsLoading(false)
        }
      } catch (error) {
        console.warn('Supabase projects fallback:', error)
        if (isMounted) {
          setProjectList(fallbackProjects)
          setIsLoading(false)
        }
      }
    }

    loadProjects()

    return () => {
      isMounted = false
    }
  }, [])

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
                key={project.id}
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
