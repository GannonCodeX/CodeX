import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import { client } from '@/sanity/lib/client'
import { generateMetadata as createMetadata } from '@/lib/metadata'
import { collectResources } from './library.mjs'
import { curatedResources } from './curated.mjs'
import hackathons from './hackathons.json'
import ResourcesClient from './ResourcesClient'

export const dynamic = 'force-dynamic'

export const metadata = createMetadata({
  title: 'Resources | Gannon CodeX',
  description: 'Find programming courses, videos, club materials, and student hackathons selected for Gannon builders.',
  keywords: ['Learning Resources', 'Student Hackathons', 'Programming', 'Workshops'],
  url: '/resources',
})

export default async function ResourcesPage() {
  let shared = []
  let sharedUnavailable = false
  try {
    // Explicitly opt records into the library. Legacy club-only links stay on their club page.
    // Filter access before projecting URLs or serializing anything to the browser.
    shared = await client.fetch(`*[
      _type == "clubResource" && librarySection in ["learn", "materials"] &&
      (!defined(accessLevel) || accessLevel == "public")
    ] | order(featured desc, publishedAt desc, _createdAt desc) {
      _id, title, description, resourceType, url, "fileUrl": file.asset->url,
      librarySection, difficulty, accessLevel, tags, featured,
      "category": category->{name}, "club": club->{title}
    }`)
  } catch (error) {
    console.error('Resource library: shared resources unavailable', error.message)
    sharedUnavailable = true
  }

  return (
    <>
      <Header />
      <ResourcesClient
        resources={collectResources(curatedResources, shared)}
        hackathons={hackathons}
        initialNow={new Date().toISOString()}
        sharedUnavailable={sharedUnavailable}
      />
      <Footer />
    </>
  )
}
