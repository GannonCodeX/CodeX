// src/app/officer/page.js
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import { client } from '@/sanity/lib/client'
import { generateMetadata as createMetadata } from '@/lib/metadata'
import OfficerSelector from './OfficerSelector'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata = createMetadata({
  title: 'Officer Dashboard',
  description: 'Access the officer dashboard for your club.',
  url: '/officer',
})

async function getClubs() {
  const query = `*[_type == "club"] | order(title asc) {
    _id,
    title,
    shortName,
    "slug": slug.current
  }`
  return client.fetch(query)
}

export default async function OfficerPage() {
  const clubs = await getClubs()

  return (
    <>
      <Header />
      <main>
        <OfficerSelector clubs={clubs} />
      </main>
      <Footer />
    </>
  )
}
