import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { hasSupabaseConfig, supabase } from '../lib/supabaseClient'
import { projects as fallbackProjects } from '../data/projects'
import ProjectCard from './ProjectCard'
import ProjectDetail from './ProjectDetail'

const staticProjects = fallbackProjects.map(normalizeProject)

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
    createdAt: project.created_at ?? project.createdAt ?? null,
    galleryTitle: project.gallery_title ?? project.galleryTitle,
  }
}

function hasSameProjectIdentity(project, candidate) {
  return (
    (candidate.slug && project.slug === candidate.slug)
    || (candidate.id && project.id === candidate.id)
  )
}

function sortNewestFirst(projects) {
  return [...projects].sort((firstProject, secondProject) => {
    const firstDate = firstProject.createdAt ? new Date(firstProject.createdAt).getTime() : 0
    const secondDate = secondProject.createdAt ? new Date(secondProject.createdAt).getTime() : 0

    return secondDate - firstDate
  })
}

function mergeProjects(staticProjectList, supabaseProjectList) {
  const sortedSupabaseProjects = sortNewestFirst(supabaseProjectList)
  const staticProjectsWithoutDuplicates = staticProjectList.filter((staticProject) => (
    !sortedSupabaseProjects.some((supabaseProject) => (
      hasSameProjectIdentity(staticProject, supabaseProject)
    ))
  ))

  return [...sortedSupabaseProjects, ...staticProjectsWithoutDuplicates]
}

function Projects() {
  const [projectList, setProjectList] = useState(staticProjects)
  const [isLoading, setIsLoading] = useState(hasSupabaseConfig)
  const navigate = useNavigate()
  const { slug } = useParams()
  const selectedProject = useMemo(
    () => projectList.find((project) => project.slug === slug) ?? null,
    [projectList, slug],
  )

  useEffect(() => {
    let isMounted = true

    async function loadProjects() {
      if (!hasSupabaseConfig || !supabase) {
        setProjectList(staticProjects)
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
          const publishedProjects = Array.isArray(data)
            ? data.map(normalizeProject).filter((project) => project.slug || project.id)
            : []

          setProjectList(mergeProjects(staticProjects, publishedProjects))
          setIsLoading(false)
        }
      } catch (error) {
        console.warn('Supabase projects fallback:', error)
        if (isMounted) {
          setProjectList(staticProjects)
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
    navigate(`/projeler/${slug}`)
  }

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
