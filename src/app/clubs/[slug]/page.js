// src/app/clubs/[slug]/page.js
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import Image from 'next/image'
import Link from 'next/link'
import { client } from '@/sanity/lib/client'
import imageUrlBuilder from '@sanity/image-url'
import styles from './slug.module.css'
import { generateMetadata as createMetadata } from '@/lib/metadata'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function generateMetadata({ params: paramsPromise }) {
  const params = await paramsPromise;
  const club = await getClub(params.slug);
  
  if (!club) {
    return createMetadata({
      title: 'Club Not Found',
      description: 'The requested club could not be found.',
      url: `/clubs/${params.slug}`
    });
  }

  return createMetadata({
    title: club.title,
    description: club.description || `Learn about ${club.title}, one of the tech clubs under the CodeX umbrella at Gannon University.`,
    keywords: ['Club', club.title, club.shortName, 'Student Organization', 'Tech Community', 'Gannon University'],
    image: club.logo ? imageUrlBuilder(client).image(club.logo).width(1200).height(630).url() : '/assets/images/2x Logo Header.png',
    url: `/clubs/${params.slug}`,
    type: 'organization'
  });
}

const builder = imageUrlBuilder(client)
const urlFor = (src) => builder.image(src)

async function getClub(slug) {
  const query = `*[_type == "club" && slug.current == $slug][0]{
    _id,
    title,
    shortName,
    description,
    logo,
    social,
    website,
    theme
  }`
  return client.fetch(query, { slug })
}

async function getClubProjectsAndEvents(clubId) {
  const projectsQuery = `*[_type == "project" && (leadClub->_id == $clubId || $clubId in collaborators[]->_id)] | order(_createdAt desc){
    title,
    "slug": slug.current,
    mainImage,
    excerpt
  }`
  const eventsQuery = `*[_type == "event" && (leadClub->_id == $clubId || $clubId in coHosts[]->_id)] | order(date desc){
    title,
    "slug": slug.current,
    date,
    status,
    location
  }`
  const [projects, events] = await Promise.all([
    client.fetch(projectsQuery, { clubId }),
    client.fetch(eventsQuery, { clubId }),
  ])
  return { projects, events }
}

export default async function ClubPage({ params: paramsPromise }) {
  const params = await paramsPromise
  const club = await getClub(params.slug)
  if (!club) {
    return (
      <div style={{ padding: 32 }}>
        <h1>Club not found</h1>
      </div>
    )
  }
  const { projects, events } = await getClubProjectsAndEvents(club._id)

  return (
    <>
      <Header />
      <main className={styles.wrapper} style={{
        ['--club-primary'] : club.theme?.primary || '#0D0D0D',
        ['--club-accent']  : club.theme?.accent  || '#00FFFF',
      }}>
        <section className={styles.hero}>
          <div className={styles.heroInner}>
            <div className={styles.logoWrap}>
              {club.logo && (
                <Image src={urlFor(club.logo).width(200).height(200).url()} alt={club.title} width={96} height={96} />
              )}
            </div>
            <div>
              <h1 className={styles.title}>{club.title}</h1>
              <p className={styles.description}>{club.description}</p>
              <div className={styles.links}>
                {club.website && <a href={club.website} target="_blank" rel="noopener noreferrer" className={styles.linkBtn}>Website</a>}
                {club.social?.github && <a href={club.social.github} target="_blank" rel="noopener noreferrer" className={styles.linkBtn}>GitHub</a>}
                {club.social?.discord && <a href={club.social.discord} target="_blank" rel="noopener noreferrer" className={styles.linkBtn}>Discord</a>}
              </div>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Projects</h2>
          <div className={styles.cards}>
            {projects?.length ? (
              projects.map((p) => (
                <Link key={p.slug} href={`/projects/${p.slug}`} className={styles.card}>
                  {p.mainImage && (
                    <div className={styles.cardImgWrap}>
                      <Image src={urlFor(p.mainImage).width(800).height(450).url()} alt={p.title} width={800} height={450} className={styles.cardImg} />
                    </div>
                  )}
                  <h3>{p.title}</h3>
                  <p>{p.excerpt}</p>
                </Link>
              ))
            ) : (
              <p>No projects yet.</p>
            )}
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Events</h2>
          <div className={styles.list}>
            {events?.length ? (
              events.map((e) => (
                <Link key={e.slug} href={`/events/${e.slug}`} className={styles.eventRow}>
                  <span className={styles.badge}>{e.status}</span>
                  <span className={styles.eventTitle}>{e.title}</span>
                  <span className={styles.eventMeta}>{new Date(e.date).toLocaleDateString()} — {e.location}</span>
                </Link>
              ))
            ) : (
              <p>No events yet.</p>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
