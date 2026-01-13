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

  const eboardMembers = members?.filter(m => m.affiliation?.isEboard) || []
  const generalMembers = members?.filter(m => !m.affiliation?.isEboard) || []

  return (
    <>
      <Header />
      <main className={styles.wrapper}>
        {/* Hero Section */}
        <section className={styles.hero}>
          <div className={styles.clubIdentity}>
            {club.logo && (
              <div className={styles.logoWrap}>
                <Image
                  src={urlFor(club.logo).width(200).height(200).url()}
                  alt={club.title}
                  width={100}
                  height={100}
                />
              </div>
            )}
            <div className={styles.clubMeta}>
              {club.shortName && (
                <span className={styles.shortName}>{club.shortName}</span>
              )}
              <h1 className={styles.title}>{club.title}</h1>
              {club.description && (
                <p className={styles.description}>{club.description}</p>
              )}
            </div>
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
              {club.social?.linkedin && (
                <a href={club.social.linkedin} target="_blank" rel="noopener noreferrer" className={styles.linkBtn}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                  LinkedIn
                </a>
              )}
            </div>
          </div>

          <div className={styles.bannerContainer}>
            {club.bannerImage ? (
              <Image
                src={urlFor(club.bannerImage).width(900).height(506).url()}
                alt={`${club.title} banner`}
                fill
                className={styles.bannerImage}
                priority
              />
            ) : (
              <div className={styles.noBanner}>
                <span className={styles.noBannerText}>{club.shortName || club.title}</span>
              </div>
            )}
          </div>
        </section>

        {/* Stats Section */}
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

        {/* Main Content Grid */}
        <div className={styles.contentGrid}>
          {/* Sidebar - Members */}
          <aside className={styles.sidebar}>
            {eboardMembers.length > 0 && (
              <div className={styles.sidebarSection}>
                <div className={styles.sidebarHeader}>
                  <h3 className={styles.sidebarTitle}>Leadership</h3>
                </div>
                <div className={styles.sidebarContent}>
                  <div className={styles.eboardList}>
                    {eboardMembers.map((member) => (
                      <div key={member.name} className={styles.eboardMember}>
                        <div className={styles.memberAvatarMedium}>
                          {member.avatar ? (
                            <Image
                              src={urlFor(member.avatar).width(96).height(96).url()}
                              alt={member.name}
                              width={48}
                              height={48}
                            />
                          ) : (
                            <div className={styles.avatarPlaceholderMedium}>
                              {member.name?.charAt(0) || '?'}
                            </div>
                          )}
                        </div>
                        <div className={styles.memberDetails}>
                          <h4 className={styles.memberName}>{member.name}</h4>
                          <span className={styles.memberRole}>
                            {member.affiliation?.clubRole || 'E-Board'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {generalMembers.length > 0 && (
              <div className={styles.sidebarSection}>
                <div className={styles.sidebarHeader}>
                  <h3 className={styles.sidebarTitle}>Members</h3>
                </div>
                <div className={styles.sidebarContent}>
                  <div className={styles.membersList}>
                    {generalMembers.map((member) => (
                      <div key={member.name} className={styles.memberChip}>
                        <div className={styles.memberChipAvatar}>
                          {member.avatar ? (
                            <Image
                              src={urlFor(member.avatar).width(48).height(48).url()}
                              alt={member.name}
                              width={24}
                              height={24}
                            />
                          ) : (
                            <div className={styles.avatarPlaceholderChip}>
                              {member.name?.charAt(0) || '?'}
                            </div>
                          )}
                        </div>
                        <span>{member.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </aside>

          {/* Main Content - Projects & Events */}
          <div className={styles.mainContent}>
            {/* Projects Section */}
            <section className={styles.section}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Projects</h2>
                <span className={styles.sectionCount}>{projects?.length || 0}</span>
              </div>
              <div className={styles.sectionContent}>
                {projects?.length ? (
                  <div className={styles.projectsGrid}>
                    {projects.map((p) => (
                      <Link key={p.slug} href={`/projects/${p.slug}`} className={styles.projectCard}>
                        {p.mainImage && (
                          <div className={styles.projectCardImage}>
                            <Image
                              src={urlFor(p.mainImage).width(600).height(338).url()}
                              alt={p.title}
                              fill
                            />
                          </div>
                        )}
                        <div className={styles.projectCardContent}>
                          <h3 className={styles.projectCardTitle}>{p.title}</h3>
                          {p.excerpt && (
                            <p className={styles.projectCardExcerpt}>{p.excerpt}</p>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className={styles.emptyState}>No projects yet.</p>
                )}
              </div>
            </section>

            {/* Events Section */}
            <section className={styles.section}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Events</h2>
                <span className={styles.sectionCount}>{events?.length || 0}</span>
              </div>
              <div className={styles.sectionContent}>
                {events?.length ? (
                  <div className={styles.eventsList}>
                    {events.map((e) => (
                      <Link key={e.slug} href={`/events/${e.slug}`} className={styles.eventRow}>
                        <span className={styles.eventBadge} data-status={e.status?.toLowerCase()}>
                          {e.status}
                        </span>
                        <div className={styles.eventInfo}>
                          <span className={styles.eventTitle}>{e.title}</span>
                          <span className={styles.eventMeta}>
                            {e.date ? new Date(e.date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            }) : 'TBD'} — {e.location || 'TBD'}
                          </span>
                        </div>
                        <span className={styles.eventArrow}>→</span>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className={styles.emptyState}>No events yet.</p>
                )}
              </div>
            </section>
          </div>
        </div>

        {/* Contact Section */}
        {club.contactEmail && (
          <section className={styles.contactSection}>
            <div className={styles.contactHeader}>
              <h2 className={styles.contactTitle}>Get in Touch</h2>
            </div>
            <div className={styles.contactContent}>
              <div className={styles.contactInfo}>
                <p className={styles.contactIntro}>
                  Have a question or want to get involved with {club.title}?
                  Send us a message and we will get back to you.
                </p>
                <p className={styles.contactEmail}>
                  Or email us directly at{' '}
                  <a href={`mailto:${club.contactEmail}`}>{club.contactEmail}</a>
                </p>
              </div>
              <ContactForm contactEmail={club.contactEmail} clubName={club.title} />
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  )
}
