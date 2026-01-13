// src/app/clubs/[slug]/page.js
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import Image from 'next/image'
import Link from 'next/link'
import { client } from '@/sanity/lib/client'
import imageUrlBuilder from '@sanity/image-url'
import styles from './slug.module.css'
import { generateMetadata as createMetadata } from '@/lib/metadata'
import ContactForm from './ContactForm'

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
    type: 'website'
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
    bannerImage,
    social,
    website,
    theme,
    contactEmail
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

async function getClubStats(clubId) {
  // Use references properly - affiliations[].club is a reference object with _ref property
  const memberCountQuery = `count(*[_type == "member" && references($clubId)])`
  const projectCountQuery = `count(*[_type == "project" && (leadClub._ref == $clubId || $clubId in collaborators[]._ref)])`
  const eventCountQuery = `count(*[_type == "event" && (leadClub._ref == $clubId || $clubId in coHosts[]._ref)])`

  const [memberCount, projectCount, eventCount] = await Promise.all([
    client.fetch(memberCountQuery, { clubId }),
    client.fetch(projectCountQuery, { clubId }),
    client.fetch(eventCountQuery, { clubId }),
  ])

  return { memberCount, projectCount, eventCount }
}

async function getClubMembers(clubId) {
  // Query members who have this club in their affiliations
  // Then extract the specific affiliation for this club
  const membersQuery = `*[_type == "member" && references($clubId)]{
    name,
    avatar,
    "affiliation": affiliations[club._ref == $clubId][0]{
      clubRole,
      isEboard
    }
  }`
  return client.fetch(membersQuery, { clubId })
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
  const stats = await getClubStats(club._id)
  const members = await getClubMembers(club._id)

  // Filter by affiliation (singular - from our query projection)
  const eboardMembers = members?.filter(m => m.affiliation?.isEboard) || []
  const generalMembers = members?.filter(m => !m.affiliation?.isEboard) || []

  return (
    <>
      <Header />
      <main className={styles.wrapper} style={{
        ['--club-primary'] : club.theme?.primary || '#0D0D0D',
        ['--club-accent']  : club.theme?.accent  || '#00FFFF',
      }}>
        <section className={`${styles.hero} ${club.bannerImage ? styles.heroWithBanner : ''}`}>
          {club.bannerImage && (
            <>
              <div className={styles.bannerImageContainer}>
                <Image
                  src={urlFor(club.bannerImage).width(1200).height(400).url()}
                  alt={`${club.title} banner`}
                  fill
                  className={styles.bannerImage}
                  priority
                />
              </div>
              <div className={styles.bannerOverlay} />
            </>
          )}
          <div className={styles.heroInner}>
            <div className={styles.logoWrap}>
              {club.logo && (
                <Image
                  src={urlFor(club.logo).width(200).height(200).url()}
                  alt={club.title}
                  width={96}
                  height={96}
                />
              )}
            </div>
            <div>
              <h1 className={styles.title}>{club.title}</h1>
              <p className={styles.description}>{club.description}</p>
              <div className={styles.links}>
                {club.website && (
                  <a href={club.website} target="_blank" rel="noopener noreferrer" className={styles.linkBtn}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                    Website
                  </a>
                )}
                {club.social?.github && (
                  <a href={club.social.github} target="_blank" rel="noopener noreferrer" className={styles.linkBtn}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>
                    GitHub
                  </a>
                )}
                {club.social?.discord && (
                  <a href={club.social.discord} target="_blank" rel="noopener noreferrer" className={styles.linkBtn}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>
                    Discord
                  </a>
                )}
                {club.social?.x && (
                  <a href={club.social.x} target="_blank" rel="noopener noreferrer" className={styles.linkBtn}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                    X
                  </a>
                )}
                {club.social?.instagram && (
                  <a href={club.social.instagram} target="_blank" rel="noopener noreferrer" className={styles.linkBtn}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
                    Instagram
                  </a>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className={styles.statsSection}>
          <div className={styles.statsGrid}>
            <div className={styles.statBox}>
              <span className={styles.statNumber}>{stats.memberCount}</span>
              <span className={styles.statLabel}>Members</span>
            </div>
            <div className={styles.statBox}>
              <span className={styles.statNumber}>{stats.projectCount}</span>
              <span className={styles.statLabel}>Projects</span>
            </div>
            <div className={styles.statBox}>
              <span className={styles.statNumber}>{stats.eventCount}</span>
              <span className={styles.statLabel}>Events</span>
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
                      <Image 
                        src={urlFor(p.mainImage).width(800).height(450).url()} 
                        alt={p.title} 
                        width={800} 
                        height={450} 
                        className={styles.cardImg} 
                      />
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
                  <span className={styles.eventMeta}>
                    {e.date ? new Date(e.date).toLocaleDateString() : 'TBD'} — {e.location || 'TBD'}
                  </span>
                </Link>
              ))
            ) : (
              <p>No events yet.</p>
            )}
          </div>
        </section>

        {members?.length > 0 && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Members</h2>

            {eboardMembers.length > 0 && (
              <div className={styles.eboardSection}>
                <h3 className={styles.eboardTitle}>Executive Board</h3>
                <div className={styles.eboardGrid}>
                  {eboardMembers.map((member) => (
                    <div key={member.name} className={styles.eboardCard}>
                      <div className={styles.memberAvatarLarge}>
                        {member.avatar ? (
                          <Image
                            src={urlFor(member.avatar).width(120).height(120).url()}
                            alt={member.name}
                            width={120}
                            height={120}
                          />
                        ) : (
                          <div className={styles.avatarPlaceholder}>
                            {member.name?.charAt(0) || '?'}
                          </div>
                        )}
                      </div>
                      <span className={styles.eboardBadge}>E-Board</span>
                      <h4 className={styles.memberName}>{member.name}</h4>
                      <span className={styles.memberRole}>{member.affiliation?.clubRole || 'Member'}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {generalMembers.length > 0 && (
              <div className={styles.membersGrid}>
                {generalMembers.map((member) => (
                  <div key={member.name} className={styles.memberCard}>
                    <div className={styles.memberAvatar}>
                      {member.avatar ? (
                        <Image
                          src={urlFor(member.avatar).width(64).height(64).url()}
                          alt={member.name}
                          width={64}
                          height={64}
                        />
                      ) : (
                        <div className={styles.avatarPlaceholderSmall}>
                          {member.name?.charAt(0) || '?'}
                        </div>
                      )}
                    </div>
                    <div className={styles.memberInfo}>
                      <span className={styles.memberNameSmall}>{member.name}</span>
                      <span className={styles.memberRoleSmall}>{member.affiliation?.clubRole || 'Member'}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {club.contactEmail && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Get in Touch</h2>
            <div className={styles.contactContainer}>
              <p className={styles.contactIntro}>
                Have a question or want to get involved? Send us a message and we will get back to you.
              </p>
              <ContactForm contactEmail={club.contactEmail} clubName={club.title} />
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  )
}
