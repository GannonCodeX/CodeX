export const RESOURCE_TYPES = [
  { value: 'link', label: 'Website' },
  { value: 'video', label: 'Video' },
  { value: 'course', label: 'Course' },
  { value: 'tool', label: 'Tool' },
  { value: 'document', label: 'Document' },
  { value: 'template', label: 'Template' },
  { value: 'guide', label: 'Guide' },
  { value: 'other', label: 'Other' },
]

export const RESOURCE_LEVELS = [
  { value: 'all', label: 'Any experience' },
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
]

export const RESOURCE_SECTIONS = [
  { value: 'learn', label: 'Learn & tools' },
  { value: 'materials', label: 'Club materials' },
]

export function safeResourceUrl(value) {
  if (typeof value !== 'string' || !value.trim()) return null
  try {
    const url = new URL(value.trim())
    if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password) return null
    return url.href
  } catch {
    return null
  }
}

export function getResourceHref(resource) {
  return safeResourceUrl(resource.url) || safeResourceUrl(resource.fileUrl)
}

export function isPublicResource(resource) {
  return resource.accessLevel == null || resource.accessLevel === 'public'
}

// File uploads stay in Studio. The officer form shares URLs for every format.
export function validateResourceInput(input) {
  const fail = (error) => ({ error })
  if (!input || typeof input !== 'object' || Array.isArray(input)) return fail('Invalid resource.')
  const title = typeof input.title === 'string' ? input.title.trim() : ''
  if (!title || title.length > 160) return fail('Enter a title of 1–160 characters.')
  const url = safeResourceUrl(input.url)
  if (!url) return fail('Enter a valid http:// or https:// resource URL.')
  const resourceType = input.resourceType ?? 'link'
  const librarySection = input.librarySection ?? 'learn'
  const difficulty = input.difficulty ?? 'all'
  if (!RESOURCE_TYPES.some(({ value }) => value === resourceType)) return fail('Choose a valid resource type.')
  if (!RESOURCE_SECTIONS.some(({ value }) => value === librarySection)) return fail('Choose a valid library section.')
  if (!RESOURCE_LEVELS.some(({ value }) => value === difficulty)) return fail('Choose a valid experience level.')
  if (input.description != null && (typeof input.description !== 'string' || input.description.length > 2000)) {
    return fail('Keep the description under 2,000 characters.')
  }
  if (input.categoryId && (typeof input.categoryId !== 'string' || !/^[\w.-]{1,128}$/.test(input.categoryId))) {
    return fail('Choose a valid category.')
  }
  const tags = input.tags ?? []
  if (!Array.isArray(tags) || tags.length > 8 || tags.some(tag => typeof tag !== 'string' || tag.trim().length > 40)) {
    return fail('Use up to 8 topic tags, each under 40 characters.')
  }
  return { value: {
    title, url, resourceType, librarySection, difficulty,
    description: (input.description || '').trim(),
    tags: [...new Set(tags.map(tag => tag.trim()).filter(Boolean))],
    ...(input.categoryId ? { category: { _type: 'reference', _ref: input.categoryId } } : {}),
  } }
}
