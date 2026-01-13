// src/app/clubs/[slug]/resources/page.js
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import Link from 'next/link'
import { client } from '@/sanity/lib/client'
import { generateMetadata as createMetadata } from '@/lib/metadata'
import styles from './resources.module.css'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function generateMetadata({ params: paramsPromise }) {
  const params = await paramsPromise
  const club = await getClub(params.slug)

  if (!club) {
    return createMetadata({
      title: 'Club Not Found',
      description: 'The requested club could not be found.',
      url: `/clubs/${params.slug}/resources`,
    })
  }

  return createMetadata({
    title: `${club.title} Resources`,
    description: `Browse resources, guides, templates, and documents shared by ${club.title}.`,
    keywords: ['Resources', 'Documents', 'Guides', club.title, 'Club Resources'],
    url: `/clubs/${params.slug}/resources`,
    type: 'website',
  })
}

async function getClub(slug) {
  const query = `*[_type == "club" && slug.current == $slug][0]{
    _id,
    title,
    shortName,
    "slug": slug.current
  }`
  return client.fetch(query, { slug })
}

async function getClubResources(clubId) {
  const query = `*[_type == "clubResource" && club._ref == $clubId] | order(featured desc, publishedAt desc){
    _id,
    title,
    description,
    resourceType,
    url,
    "fileUrl": file.asset->url,
    tags,
    featured,
    accessLevel,
    publishedAt,
    "category": category->{
      _id,
      name,
      "slug": slug.current,
      icon,
      order
    }
  }`
  return client.fetch(query, { clubId })
}

async function getResourceCategories() {
  const query = `*[_type == "resourceCategory"] | order(order asc){
    _id,
    name,
    "slug": slug.current,
    icon,
    description,
    order
  }`
  return client.fetch(query)
}

// Group resources by category
function groupResourcesByCategory(resources, categories) {
  const grouped = {}
  const uncategorized = []

  // Initialize groups for each category
  categories.forEach((cat) => {
    grouped[cat._id] = {
      category: cat,
      resources: [],
    }
  })

  // Sort resources into groups
  resources.forEach((resource) => {
    if (resource.category?._id && grouped[resource.category._id]) {
      grouped[resource.category._id].resources.push(resource)
    } else {
      uncategorized.push(resource)
    }
  })

  // Convert to array and filter out empty categories
  const result = Object.values(grouped).filter((g) => g.resources.length > 0)

  // Add uncategorized if any
  if (uncategorized.length > 0) {
    result.push({
      category: { _id: 'uncategorized', name: 'Other Resources', icon: null, order: 9999 },
      resources: uncategorized,
    })
  }

  return result
}

// Get icon for resource type
function getResourceTypeIcon(type) {
  switch (type) {
    case 'link':
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
          <polyline points="15 3 21 3 21 9" />
          <line x1="10" y1="14" x2="21" y2="3" />
        </svg>
      )
    case 'document':
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
      )
    case 'template':
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <line x1="3" y1="9" x2="21" y2="9" />
          <line x1="9" y1="21" x2="9" y2="9" />
        </svg>
      )
    case 'guide':
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
      )
    default:
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
      )
  }
}

export default async function ClubResourcesPage({ params: paramsPromise }) {
  const params = await paramsPromise
  const club = await getClub(params.slug)

  if (!club) {
    return (
      <>
        <Header />
        <main className={styles.wrapper}>
          <div className={styles.container}>
            <div className={styles.notFound}>
              <h1>Club Not Found</h1>
              <p>The club you&apos;re looking for doesn&apos;t exist.</p>
              <Link href="/clubs" className={styles.backLink}>
                &larr; Back to Clubs
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  const [resources, categories] = await Promise.all([
    getClubResources(club._id),
    getResourceCategories(),
  ])

  const featuredResources = resources.filter((r) => r.featured)
  const groupedResources = groupResourcesByCategory(resources, categories)

  return (
    <>
      <Header />
      <main className={styles.wrapper}>
        <div className={styles.container}>
          <Link href={`/clubs/${params.slug}`} className={styles.backLink}>
            &larr; Back to {club.title}
          </Link>

          <header className={styles.header}>
            <h1 className={styles.title}>// {club.shortName || club.title} Resources</h1>
            <p className={styles.description}>
              Browse resources, guides, templates, and documents shared by {club.title}.
            </p>
          </header>

          {/* Featured Resources */}
          {featuredResources.length > 0 && (
            <section className={styles.featuredSection}>
              <h2 className={styles.sectionTitle}>// Featured</h2>
              <div className={styles.featuredGrid}>
                {featuredResources.map((resource) => (
                  <ResourceCard
                    key={resource._id}
                    resource={resource}
                    featured
                  />
                ))}
              </div>
            </section>
          )}

          {/* Resources by Category */}
          {groupedResources.length > 0 ? (
            <div className={styles.categoriesContainer}>
              {groupedResources.map((group) => (
                <section key={group.category._id} className={styles.categorySection}>
                  <h2 className={styles.categoryTitle}>
                    {group.category.icon && (
                      <span className={styles.categoryIcon}>{group.category.icon}</span>
                    )}
                    {group.category.name}
                  </h2>
                  {group.category.description && (
                    <p className={styles.categoryDescription}>{group.category.description}</p>
                  )}
                  <div className={styles.resourcesGrid}>
                    {group.resources.map((resource) => (
                      <ResourceCard key={resource._id} resource={resource} />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <p>No resources have been shared yet.</p>
              <p className={styles.emptyHint}>Check back later for guides, templates, and other helpful materials.</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}

function ResourceCard({ resource, featured = false }) {
  const href = resource.resourceType === 'link' ? resource.url : resource.fileUrl
  const isExternal = resource.resourceType === 'link'

  return (
    <a
      href={href || '#'}
      target={href ? '_blank' : undefined}
      rel={href ? 'noopener noreferrer' : undefined}
      className={`${styles.resourceCard} ${featured ? styles.featuredCard : ''}`}
    >
      <div className={styles.resourceHeader}>
        <span className={`${styles.typeBadge} ${styles[`type${resource.resourceType?.charAt(0).toUpperCase()}${resource.resourceType?.slice(1)}`] || ''}`}>
          {getResourceTypeIcon(resource.resourceType)}
          {resource.resourceType || 'resource'}
        </span>
        {resource.accessLevel === 'members' && (
          <span className={styles.membersBadge}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            Members
          </span>
        )}
      </div>

      <h3 className={styles.resourceTitle}>{resource.title}</h3>

      {resource.description && (
        <p className={styles.resourceDescription}>{resource.description}</p>
      )}

      {resource.tags?.length > 0 && (
        <div className={styles.tags}>
          {resource.tags.slice(0, 3).map((tag) => (
            <span key={tag} className={styles.tag}>
              {tag}
            </span>
          ))}
          {resource.tags.length > 3 && (
            <span className={styles.tagMore}>+{resource.tags.length - 3}</span>
          )}
        </div>
      )}

      <div className={styles.resourceFooter}>
        {resource.publishedAt && (
          <span className={styles.publishedDate}>
            {new Date(resource.publishedAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </span>
        )}
        <span className={styles.viewLink}>
          {isExternal ? 'Open Link' : 'Download'}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </span>
      </div>
    </a>
  )
}
