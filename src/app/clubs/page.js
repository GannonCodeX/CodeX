// src/app/clubs/page.js
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import Image from 'next/image'
import Link from 'next/link'
import { client } from '@/sanity/lib/client'
import imageUrlBuilder from '@sanity/image-url'
import styles from './clubs.module.css'
import { generateMetadata as createMetadata } from '@/lib/metadata'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata = createMetadata({
  title: 'Clubs',
  description: 'Discover the four tech clubs under the CodeX umbrella at Gannon University: CodeX, GUPc, ACM, and CyberSec. Find your community and join the movement.',
  keywords: ['Clubs', 'Student Organizations', 'ACM', 'CyberSec', 'GUPc', 'Programming Club', 'Tech Community'],
  url: '/clubs'
})

const builder = imageUrlBuilder(client)
const urlFor = (src) => builder.image(src)

async function getClubs() {
  const query = `*[_type == "club"] | order(title asc){
    title,
    shortName,
    description,
    "slug": slug.current,
    logo
  }`
  return client.fetch(query)
}

export default async function ClubsPage() {
  const clubs = await getClubs()

  return (
    <>
      <Header />
      <main className={styles.wrapper}>
        <section className={styles.hero}>
          <h1 className={styles.title}>// Student Tech Organizations at Gannon University</h1>
          <p className={styles.subtitle}>
            Discover four premier technology clubs at Gannon University in Erie, PA: CodeX for software development, GUPc for programming, ACM for computer science, and CyberSec for cybersecurity. Join a community of student developers, programmers, and tech enthusiasts building innovative projects together.
          </p>
        </section>

        <section className={styles.grid}>
          {clubs?.map((club) => (
            <Link key={club.slug} href={`/clubs/${club.slug}`} className={styles.card}>
              <div className={styles.cardHeader}>
                <div className={styles.logoWrap}>
                  {club.logo && (
                    <Image
                      src={urlFor(club.logo).width(200).height(200).url()}
                      alt={club.title}
                      width={64}
                      height={64}
                    />
                  )}
                </div>
                <div>
                  <h3 className={styles.cardTitle}>{club.title}</h3>
                  {club.shortName && <span className={styles.badge}>{club.shortName}</span>}
                </div>
              </div>
              <p className={styles.cardText}>{club.description}</p>
              <span className={styles.cardCta}>Explore →</span>
            </Link>
          ))}
        </section>
      </main>
      <Footer />
    </>
  )
}
