function ProjectCard({ project, index, onSelect }) {
  return (
    <button
      className="project-card"
      type="button"
      onClick={() => onSelect(project.slug)}
      aria-label={`${project.title} projesini incele`}
    >
      <span className="project-number">{String(index + 1).padStart(2, '0')}</span>
      <div className="project-content">
        <span className="project-category">{project.category}</span>
        <h2>{project.title}</h2>
        <p>{project.summary}</p>
        <span className="project-card-action">Projeyi incele</span>
      </div>
      <span className="project-arrow" aria-hidden="true">↗</span>
    </button>
  )
}

export default ProjectCard

