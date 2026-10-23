import { Link } from 'react-router-dom'
import { itemPath } from '../lib/seo.js'

function ProjectCard({ project, index }) {
  return (
    <Link
      className="project-card"
      to={itemPath('/projeler', project)}
      aria-label={`${project.title} projesini incele`}
    >
      <span className="project-number">{String(index + 1).padStart(2, '0')}</span>
      <div className="project-content">
        <div className="project-card-meta">
          <span className="project-category">{project.category}</span>
          {project.status && <span className="project-status">{project.status}</span>}
        </div>
        <h2>{project.title}</h2>
        <p>{project.summary}</p>
        <span className="project-card-action">Projeyi incele</span>
      </div>
      <span className="project-arrow" aria-hidden="true">↗</span>
    </Link>
  )
}

export default ProjectCard
