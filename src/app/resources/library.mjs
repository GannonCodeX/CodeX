import { getResourceHref, isPublicResource, RESOURCE_TYPES, RESOURCE_LEVELS } from '../../lib/resources.mjs'

export function collectResources(curated, shared) {
  const seen = new Set()
  return [...shared, ...curated]
    .filter(resource => isPublicResource(resource) && ['learn', 'materials'].includes(resource.librarySection))
    .map(resource => ({ ...resource, url: getResourceHref(resource) }))
    .filter(resource => {
      if (!resource.url || !resource.title) return false
      const key = `${resource.librarySection}:${resource.url.replace(/\/$/, '')}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
    .map(resource => ({
      id: resource._id,
      starterId: curated.find(item => item.url === resource.url)?._id,
      title: resource.title,
      description: resource.description || '',
      url: resource.url,
      resourceType: RESOURCE_TYPES.some(t => t.value === resource.resourceType) ? resource.resourceType : 'link',
      difficulty: RESOURCE_LEVELS.some(l => l.value === resource.difficulty) ? resource.difficulty : 'all',
      librarySection: resource.librarySection,
      tags: [...new Set([resource.category?.name, ...(resource.tags || [])].filter(Boolean))],
      provider: resource.provider || resource.club?.title || new URL(resource.url).hostname.replace(/^www\./, ''),
      featured: !!resource.featured,
    }))
    .sort((a, b) => Number(b.featured) - Number(a.featured))
}

export function filterResources(resources, { section = 'learn', search = '', type = '', topic = '', level = '' } = {}) {
  const terms = search.toLowerCase().trim().split(/\s+/).filter(Boolean)
  return resources.filter(resource => {
    const text = [resource.title, resource.description, resource.provider, ...resource.tags].join(' ').toLowerCase()
    return resource.librarySection === section && (!type || resource.resourceType === type) &&
      (!topic || resource.tags.includes(topic)) && (!level || resource.difficulty === level) &&
      terms.every(term => text.includes(term))
  })
}

export function dateInEastern(now) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/New_York', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(now))
}

export function hackathonStatus(event, now, checked) {
  const today = dateInEastern(now)
  if (event.end && today > event.end) return { key: 'ended', label: 'Event ended' }
  if (event.start && today >= event.start) return { key: 'closed', label: 'Event underway' }
  if (event.status === 'Closed' || (event.deadlineAt ? new Date(now) >= new Date(event.deadlineAt) : event.deadline && today > event.deadline)) {
    return { key: 'closed', label: 'Applications closed' }
  }
  // A dated research snapshot must not keep claiming admission is open indefinitely.
  const stale = new Date(now) - new Date(`${checked}T00:00:00-04:00`) > 14 * 86400000
  if (event.status === 'Open' && !stale) return { key: 'open', label: 'Applications open' }
  if (event.status === 'Portal live' || event.status === 'Open') return { key: 'check', label: 'Check availability' }
  return { key: 'watch', label: event.status === 'Opening unclear' ? 'Opening unclear' : 'Watchlist' }
}

export function upcomingDeadline(event, now) {
  const today = dateInEastern(now)
  if (event.priority && (event.priorityAt ? new Date(now) < new Date(event.priorityAt) : event.priority >= today)) {
    return { date: event.priority, label: 'Priority deadline' }
  }
  return { date: event.deadline, label: 'Application deadline' }
}

export function filterHackathons(events, { search = '', status = '', teamOfFour = false, now, checked }) {
  const terms = search.toLowerCase().trim().split(/\s+/).filter(Boolean)
  const rank = { open: 0, check: 1, watch: 2, closed: 3, ended: 4 }
  return events.filter(event => {
    const text = [event.name, event.school, event.city, event.notes, event.reason].filter(Boolean).join(' ').toLowerCase()
    return (!status || hackathonStatus(event, now, checked).key === status) &&
      (!teamOfFour || (typeof event.team === 'number' && event.team >= 4)) && terms.every(term => text.includes(term))
  }).sort((a, b) => rank[hackathonStatus(a, now, checked).key] - rank[hackathonStatus(b, now, checked).key] ||
    (upcomingDeadline(a, now).date || '9999').localeCompare(upcomingDeadline(b, now).date || '9999') ||
    (a.start || '9999').localeCompare(b.start || '9999'))
}

export function formatDate(date, options = {}) {
  if (!date) return 'Not announced'
  return new Date(`${date}T12:00:00Z`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC', ...options })
}
