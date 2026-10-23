import { projects as staticProjects } from '../data/projects.js'
import { projectJournalEntries as staticJournal } from '../data/projectJournal.js'

export function toArray(value) {
  const items = Array.isArray(value) ? value : typeof value === 'string' ? value.split(/[\n,]+/) : []
  return items.filter((item) => typeof item === 'string').map((item) => item.trim()).filter(Boolean)
}

export function normalizeProject(project) {
  return {
    id: project.id ?? project.slug,
    slug: typeof project.slug === 'string' ? project.slug.trim() : '',
    title: project.title,
    category: project.category,
    summary: project.summary,
    description: project.description,
    role: project.role,
    status: project.status,
    tools: toArray(project.tools),
    images: toArray(project.images),
    pdfUrl: project.pdf_url ?? project.pdfUrl ?? null,
    portfolioUrl: project.portfolio_url ?? project.portfolioUrl ?? null,
    githubUrl: project.github_url ?? project.githubUrl ?? null,
    createdAt: project.created_at ?? project.createdAt ?? null,
    updatedAt: project.updated_at ?? project.updatedAt ?? null,
    galleryTitle: project.gallery_title ?? project.galleryTitle,
    seoTitle: project.seo_title ?? project.seoTitle,
    seoDescription: project.seo_description ?? project.seoDescription,
  }
}

export function normalizeJournalEntry(entry) {
  return {
    id: entry.id ?? entry.slug,
    slug: typeof entry.slug === 'string' ? entry.slug.trim() : '',
    title: entry.title,
    summary: entry.summary,
    status: entry.status,
    projectName: entry.project_name ?? entry.projectName ?? '',
    date: entry.date ?? null,
    content: entry.content ?? entry.description ?? '',
    tags: toArray(entry.tags),
    images: toArray(entry.images),
    pdfUrl: typeof (entry.pdf_url ?? entry.pdfUrl) === 'string' ? (entry.pdf_url ?? entry.pdfUrl).trim() : '',
    relatedProjectSlug: entry.related_project_slug ?? entry.relatedProjectSlug ?? null,
    createdAt: entry.created_at ?? entry.createdAt ?? null,
    updatedAt: entry.updated_at ?? entry.updatedAt ?? null,
    seoTitle: entry.seo_title ?? entry.seoTitle,
    seoDescription: entry.seo_description ?? entry.seoDescription,
  }
}

export function getStaticContent() {
  return {
    projects: staticProjects.filter((item) => item.status !== 'draft').map(normalizeProject),
    journal: staticJournal.filter((item) => item.status !== 'draft').map(normalizeJournalEntry),
    available: { projects: false, journal: false },
  }
}

function timestamp(value) {
  const time = value ? Date.parse(value) : 0
  return Number.isFinite(time) ? time : 0
}

export function mergePublished(staticItems, remoteItems, normalize, journal = false) {
  const sorted = remoteItems.filter((item) => item.status === 'published').map(normalize)
    .sort((a, b) => timestamp(journal ? b.date ?? b.createdAt : b.createdAt)
      - timestamp(journal ? a.date ?? a.createdAt : a.createdAt))
  const seen = new Set()
  return [...sorted, ...staticItems].filter((item) => {
    if (!item.slug || item.status === 'draft' || seen.has(item.slug)) return false
    seen.add(item.slug)
    return true
  })
}

// Public reads never use an admin session or a service/secret key, including during SSR.
class PublicContentError extends Error {
  constructor(reason, status) {
    super(`Public content unavailable: ${reason}`)
    this.name = 'PublicContentError'
    this.reason = reason
    this.status = status
  }
}

async function fetchPublished(table, { url, anonKey, fetchImpl }) {
  const rows = []
  const pageSize = 1000
  for (let offset = 0; ; offset += pageSize) {
    const endpoint = new URL(`/rest/v1/${table}`, url)
    endpoint.searchParams.set('select', '*')
    endpoint.searchParams.set('status', 'eq.published')
    endpoint.searchParams.set('order', 'id.asc')
    endpoint.searchParams.set('offset', String(offset))
    endpoint.searchParams.set('limit', String(pageSize))
    let response
    try {
      response = await fetchImpl(endpoint, {
        headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}` },
        signal: AbortSignal.timeout(8000),
      })
    } catch (error) {
      throw new PublicContentError(['TimeoutError', 'AbortError'].includes(error?.name) ? 'timeout' : 'network_error')
    }
    if (!response.ok) throw new PublicContentError('http_error', response.status)
    let page
    try { page = await response.json() }
    catch { throw new PublicContentError('invalid_json', response.status) }
    if (!Array.isArray(page) || page.some((item) => !item || typeof item !== 'object')) {
      throw new PublicContentError('invalid_response', response.status)
    }
    rows.push(...page)
    if (page.length < pageSize) return rows
  }
}

export async function loadPublicContent({ url, anonKey, fetchImpl = fetch, onUnavailable } = {}) {
  const content = getStaticContent()
  if (!url || !anonKey) {
    onUnavailable?.({ reason: 'missing_configuration', hasUrl: Boolean(url), hasAnonKey: Boolean(anonKey) })
    return content
  }
  try {
    const endpoint = new URL(url)
    if (!['https:', 'http:'].includes(endpoint.protocol)) throw new Error('Invalid protocol')
  } catch {
    onUnavailable?.({ reason: 'invalid_configuration', hasUrl: Boolean(url), hasAnonKey: Boolean(anonKey) })
    return content
  }
  const results = await Promise.allSettled([
    fetchPublished('projects', { url, anonKey, fetchImpl }),
    fetchPublished('project_journal', { url, anonKey, fetchImpl }),
  ])
  results.forEach((result, index) => {
    const key = index === 0 ? 'projects' : 'journal'
    if (result.status === 'fulfilled') {
      content[key] = mergePublished(content[key], result.value,
        index === 0 ? normalizeProject : normalizeJournalEntry, index === 1)
      content.available[key] = true
    } else {
      // Only known upstream failures are recoverable. Programming/runtime faults
      // must reach the caller's error boundary rather than masquerade as success.
      if (!(result.reason instanceof PublicContentError)) throw result.reason
      if (onUnavailable) {
        onUnavailable({
          table: index === 0 ? 'projects' : 'project_journal',
          reason: result.reason.reason,
          ...(result.reason.status != null ? { status: result.reason.status } : {}),
        })
      } else {
        console.warn(`Public ${key} unavailable; using static content.`)
      }
    }
  })
  return content
}
