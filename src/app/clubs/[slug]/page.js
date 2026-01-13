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
    engage,
    theme,
    contactEmail,
    acceptingMembers,
    joinInstructions,
    joinLink,
    membershipRequirements,
    meetingSchedule,
    meetingLocation,
    meetingNotes,
    gallery[]{
      image,
      caption,
      alt
    }
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

async function getClubAnnouncements(clubId) {
  const announcementsQuery = `*[_type == "announcement" && club._ref == $clubId] | order(pinned desc, publishedAt desc){
    _id,
    title,
    "slug": slug.current,
    content,
    publishedAt,
    pinned,
    type
  }`
  return client.fetch(announcementsQuery, { clubId })
}

async function getClubResourcesCount(clubId) {
  const countQuery = `count(*[_type == "clubResource" && club._ref == $clubId])`
  return client.fetch(countQuery, { clubId })
}

async function getClubPolls(clubId) {
  const pollsQuery = `*[_type == "availabilityPoll" && club._ref == $clubId] | order(createdAt desc){
    _id,
    title,
    "slug": slug.current,
    description,
    createdAt,
    expiresAt,
    "responseCount": count(responses)
  }`
  return client.fetch(pollsQuery, { clubId })
}

// Helper function to extract plain text from portable text blocks
function getPlainTextFromBlocks(blocks) {
  if (!blocks || !Array.isArray(blocks)) return ''
  return blocks
    .filter(block => block._type === 'block')
    .map(block => {
      if (!block.children) return ''
      return block.children
        .filter(child => child._type === 'span')
        .map(span => span.text)
        .join('')
    })
    .join(' ')
}

export default async function ClubPage({ params: paramsPromise }) {
  const params = await paramsPromise
  const club = await getClub(params.slug)
  if (!club) {
    return <div>Club not found</div>
  }
  const { projects, events } = await getClubProjectsAndEvents(club._id)
  const stats = await getClubStats(club._id)
  const members = await getClubMembers(club._id)
  const announcements = await getClubAnnouncements(club._id)
  const resourcesCount = await getClubResourcesCount(club._id)
  const polls = await getClubPolls(club._id)

  const eboardMembers = members?.filter(m => m.affiliation?.isEboard) || []
  const generalMembers = members?.filter(m => !m.affiliation?.isEboard) || []

  return (
    <>
      <Header />
      <main className={styles.wrapper}>
        <article>
          <header className={styles.header}>
            <Link href="/clubs" className={styles.backLink}>&larr; All Clubs</Link>

            {club.bannerImage && (
              <div className={styles.imageWrapper}>
                <Image
                  src={urlFor(club.bannerImage).width(1200).height(675).url()}
                  alt={`${club.title} banner`}
                  width={1200}
                  height={675}
                  className={styles.bannerImage}
                  priority
                />
              </div>
            )}

            <div className={styles.clubHeader}>
              {club.logo && (
                <div className={styles.logoWrap}>
                  <Image
                    src={urlFor(club.logo).width(160).height(160).url()}
                    alt={club.title}
                    width={80}
                    height={80}
                  />
                </div>
              )}
              <h1 className={styles.title}>{club.title}</h1>
            </div>

            {club.description && (
              <p className={styles.description}>{club.description}</p>
            )}

            <div className={styles.links}>
              {club.engage && (
                <a href={club.engage} target="_blank" rel="noopener noreferrer" className={`${styles.linkBtn} ${styles.engageBtn}`}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                  Engage
                </a>
              )}
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
              {resourcesCount > 0 && (
                <Link href={`/clubs/${params.slug}/resources`} className={styles.linkBtn}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                  Resources
                </Link>
              )}
            </div>
          </header>

          {/* Join Section */}
          <section className={styles.joinSection}>
            <div className={styles.joinContent}>
              <h2 className={styles.joinTitle}>// Join {club.title}</h2>

              {club.acceptingMembers === false ? (
                <div className={styles.notAccepting}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  <span>Not currently accepting new members</span>
                </div>
              ) : (
                <>
                  <div className={styles.joinInfo}>
                    {club.membershipRequirements && (
                      <div className={styles.joinRequirements}>
                        <h3>Requirements</h3>
                        <p>{club.membershipRequirements}</p>
                      </div>
                    )}

                    {club.joinInstructions && (
                      <div className={styles.joinInstructions}>
                        <h3>How to Join</h3>
                        <p>{club.joinInstructions}</p>
                      </div>
                    )}

                    {!club.joinInstructions && !club.membershipRequirements && (
                      <p className={styles.joinDefaultText}>
                        Interested in joining {club.title}? We&apos;d love to have you!
                      </p>
                    )}
                  </div>

                  <div className={styles.joinActions}>
                    {club.joinLink && (
                      <a href={club.joinLink} target="_blank" rel="noopener noreferrer" className={styles.joinBtn}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                          <circle cx="8.5" cy="7" r="4"/>
                          <line x1="20" y1="8" x2="20" y2="14"/>
                          <line x1="23" y1="11" x2="17" y2="11"/>
                        </svg>
                        Join Now
                      </a>
                    )}
                    {club.engage && !club.joinLink && (
                      <a href={club.engage} target="_blank" rel="noopener noreferrer" className={styles.joinBtn}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                        </svg>
                        Join via Engage
                      </a>
                    )}
                    {club.contactEmail && (
                      <a href={`mailto:${club.contactEmail}?subject=Interested in joining ${club.title}`} className={styles.joinEmailBtn}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                          <polyline points="22,6 12,13 2,6"/>
                        </svg>
                        Email Us
                      </a>
                    )}
                  </div>
                </>
              )}
            </div>
          </section>

          <div className={styles.contentGrid}>
            <aside className={styles.sidebar}>
              {/* Stats */}
              <div className={styles.infoBox}>
                <h2 className={styles.sidebarTitle}>// Stats</h2>
                <div className={styles.statsGrid}>
                  <div className={styles.statItem}>
                    <span>Members</span>
                    <span className={styles.statNumber}>{stats.memberCount}</span>
                  </div>
                  <div className={styles.statItem}>
                    <span>Projects</span>
                    <span className={styles.statNumber}>{stats.projectCount}</span>
                  </div>
                  <div className={styles.statItem}>
                    <span>Events</span>
                    <span className={styles.statNumber}>{stats.eventCount}</span>
                  </div>
                </div>
              </div>

              {/* Meetings */}
              {(club.meetingSchedule?.dayOfWeek || club.meetingLocation) && (
                <div className={styles.infoBox}>
                  <h2 className={styles.sidebarTitle}>// Meetings</h2>
                  <div className={styles.meetingInfo}>
                    {club.meetingSchedule?.dayOfWeek && (
                      <p className={styles.meetingSchedule}>
                        {club.meetingSchedule.frequency === 'weekly' && 'Every '}
                        {club.meetingSchedule.frequency === 'biweekly' && 'Every other '}
                        {club.meetingSchedule.frequency === 'monthly' && 'Monthly on '}
                        {club.meetingSchedule.dayOfWeek}
                        {club.meetingSchedule.time && ` at ${club.meetingSchedule.time}`}
                      </p>
                    )}
                    {club.meetingLocation && (
                      <p className={styles.meetingLocation}>{club.meetingLocation}</p>
                    )}
                    {club.meetingNotes && (
                      <p className={styles.meetingNotes}>{club.meetingNotes}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Leadership */}
              {eboardMembers.length > 0 && (
                <div className={styles.infoBox}>
                  <h2 className={styles.sidebarTitle}>// Leadership</h2>
                  <div className={styles.membersList}>
                    {eboardMembers.map((member) => (
                      <div key={member.name} className={styles.memberItem}>
                        <div className={styles.memberAvatar}>
                          {member.avatar ? (
                            <Image
                              src={urlFor(member.avatar).width(80).height(80).url()}
                              alt={member.name}
                              width={40}
                              height={40}
                            />
                          ) : (
                            <div className={styles.avatarPlaceholder}>
                              {member.name?.charAt(0) || '?'}
                            </div>
                          )}
                        </div>
                        <div className={styles.memberInfo}>
                          <span className={styles.memberName}>{member.name}</span>
                          <span className={styles.memberRole}>
                            {member.affiliation?.clubRole || 'E-Board'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Members */}
              {generalMembers.length > 0 && (
                <div className={styles.infoBox}>
                  <h2 className={styles.sidebarTitle}>// Members</h2>
                  <div className={styles.membersChips}>
                    {generalMembers.map((member) => (
                      <span key={member.name} className={styles.memberChip}>
                        {member.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </aside>

            <div className={styles.mainContent}>
              {/* Announcements */}
              {announcements?.length > 0 && (
                <section className={styles.section}>
                  <h2 className={styles.sectionTitle}>// Announcements</h2>
                  <div className={styles.announcementsList}>
                    {announcements.map((announcement) => {
                      const excerpt = getPlainTextFromBlocks(announcement.content)
                      const truncatedExcerpt = excerpt.length > 200
                        ? excerpt.substring(0, 200) + '...'
                        : excerpt
                      return (
                        <div
                          key={announcement._id}
                          className={`${styles.announcementCard} ${announcement.pinned ? styles.pinnedAnnouncement : ''} ${styles[`announcement${announcement.type?.charAt(0).toUpperCase()}${announcement.type?.slice(1)}`] || ''}`}
                        >
                          <div className={styles.announcementHeader}>
                            <div className={styles.announcementMeta}>
                              {announcement.pinned && (
                                <span className={styles.pinnedBadge}>
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2l-2-2z"/>
                                  </svg>
                                  Pinned
                                </span>
                              )}
                              <span className={`${styles.typeBadge} ${styles[`type${announcement.type?.charAt(0).toUpperCase()}${announcement.type?.slice(1)}`] || ''}`}>
                                {announcement.type || 'news'}
                              </span>
                              {announcement.publishedAt && (
                                <span className={styles.announcementDate}>
                                  {new Date(announcement.publishedAt).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric'
                                  })}
                                </span>
                              )}
                            </div>
                          </div>
                          <h3 className={styles.announcementTitle}>{announcement.title}</h3>
                          {truncatedExcerpt && (
                            <p className={styles.announcementExcerpt}>{truncatedExcerpt}</p>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </section>
              )}

              {/* Projects */}
              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>// Projects</h2>
                {projects?.length ? (
                  <div className={styles.projectsGrid}>
                    {projects.map((p) => (
                      <Link key={p.slug} href={`/projects/${p.slug}`} className={styles.projectCard}>
                        {p.mainImage && (
                          <div className={styles.projectCardImage}>
                            <Image
                              src={urlFor(p.mainImage).width(600).height(338).url()}
                              alt={p.title}
                              width={600}
                              height={338}
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
              </section>

              {/* Events */}
              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>// Events</h2>
                {events?.length ? (
                  <div className={styles.eventsList}>
                    {events.map((e) => {
                      const isPast = e.date && new Date(e.date) < new Date()
                      return (
                        <Link
                          key={e.slug}
                          href={`/events/${e.slug}`}
                          className={`${styles.eventItem} ${isPast ? styles.pastEvent : ''}`}
                        >
                          <span className={styles.eventBadge}>{e.status}</span>
                          <div className={styles.eventInfo}>
                            <div className={styles.eventTitle}>{e.title}</div>
                            <div className={styles.eventMeta}>
                              {e.date ? new Date(e.date).toLocaleDateString('en-US', {
                                month: 'long',
                                day: 'numeric',
                                year: 'numeric'
                              }) : 'TBD'} — {e.location || 'TBD'}
                            </div>
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                ) : (
                  <p className={styles.emptyState}>No events yet.</p>
                )}
              </section>

              {/* Availability Polls */}
              {polls?.length > 0 && (
                <section className={styles.section}>
                  <h2 className={styles.sectionTitle}>// Availability Polls</h2>
                  <div className={styles.pollsList}>
                    {polls.map((poll) => {
                      const isExpired = poll.expiresAt && new Date(poll.expiresAt) < new Date()
                      return (
                        <Link
                          key={poll._id}
                          href={`/schedule/${poll.slug}`}
                          className={`${styles.pollItem} ${isExpired ? styles.expiredPoll : ''}`}
                        >
                          <div className={styles.pollInfo}>
                            <div className={styles.pollTitle}>{poll.title}</div>
                            {poll.description && (
                              <div className={styles.pollDescription}>
                                {poll.description.length > 100
                                  ? poll.description.substring(0, 100) + '...'
                                  : poll.description}
                              </div>
                            )}
                            <div className={styles.pollMeta}>
                              {poll.createdAt && new Date(poll.createdAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                              {isExpired && <span className={styles.expiredTag}>Expired</span>}
                            </div>
                          </div>
                          <div className={styles.pollResponses}>
                            <span className={styles.pollResponseCount}>{poll.responseCount || 0}</span>
                            <span className={styles.pollResponseLabel}>response{poll.responseCount !== 1 ? 's' : ''}</span>
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                </section>
              )}

              {/* Photo Gallery */}
              {club.gallery?.length > 0 && (
                <section className={styles.section}>
                  <div className={styles.galleryHeader}>
                    <h2 className={styles.sectionTitle}>// Photo Gallery</h2>
                    {club.gallery.length > 8 && (
                      <span className={styles.galleryCount}>
                        Showing 8 of {club.gallery.length} photos
                      </span>
                    )}
                  </div>
                  <div className={styles.galleryGrid}>
                    {club.gallery.slice(0, 8).map((item, index) => (
                      <div key={index} className={styles.galleryItem}>
                        <div className={styles.galleryImageWrapper}>
                          <Image
                            src={urlFor(item.image).width(400).height(300).url()}
                            alt={item.alt || item.caption || `${club.title} photo ${index + 1}`}
                            width={400}
                            height={300}
                            className={styles.galleryImage}
                          />
                          <div className={styles.galleryOverlay}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <circle cx="11" cy="11" r="8"/>
                              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                              <line x1="11" y1="8" x2="11" y2="14"/>
                              <line x1="8" y1="11" x2="14" y2="11"/>
                            </svg>
                          </div>
                        </div>
                        {item.caption && (
                          <p className={styles.galleryCaption}>{item.caption}</p>
                        )}
                      </div>
                    ))}
                  </div>
                  {club.gallery.length > 8 && (
                    <div className={styles.galleryViewAll}>
                      <button className={styles.viewAllBtn}>
                        View All {club.gallery.length} Photos
                      </button>
                    </div>
                  )}
                </section>
              )}
            </div>
          </div>

          {/* Contact Section */}
          {club.contactEmail && (
            <section className={styles.contactSection}>
              <h2 className={styles.sectionTitle}>// Get in Touch</h2>
              <div className={styles.contactGrid}>
                <div className={styles.contactInfo}>
                  <p>Have a question or want to get involved with {club.title}? Send us a message.</p>
                  <p>Or email us at <a href={`mailto:${club.contactEmail}`}>{club.contactEmail}</a></p>
                </div>
                <ContactForm contactEmail={club.contactEmail} clubName={club.title} />
              </div>
            </section>
          )}
        </article>
      </main>
      <Footer />
    </>
  )
}
