// src/app/schedule/page.js
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import Link from 'next/link'
import { client } from '@/sanity/lib/client'
import styles from './schedule.module.css'
import { generateMetadata as createMetadata } from '@/lib/metadata'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata = createMetadata({
  title: 'Schedule',
  description: 'Find the best meeting time for your team with our When2Meet-style availability tool.',
  url: '/schedule',
})

async function getPolls() {
  const query = `*[_type == "availabilityPoll"] | order(createdAt desc) {
    _id,
    title,
    "slug": slug.current,
    description,
    createdBy,
    createdAt,
    dates,
    "responseCount": count(responses),
    "club": club->{
      title,
      shortName
    }
  }`
  return client.fetch(query)
}

export default async function SchedulePage() {
  const polls = await getPolls()

  return (
    <>
      <Header />
      <main className={styles.wrapper}>
        <div className={styles.container}>
          <header className={styles.header}>
            <h1 className={styles.title}>// Schedule</h1>
            <p className={styles.subtitle}>
              Find the best meeting time for your team. Create a poll and share
              it with your club or project team.
            </p>
            <Link href="/schedule/new" className={styles.createBtn}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Create New Poll
            </Link>
          </header>

          <section className={styles.pollsSection}>
            <h2 className={styles.sectionTitle}>// Recent Polls</h2>
            {polls?.length > 0 ? (
              <div className={styles.pollsGrid}>
                {polls.map((poll) => (
                  <Link
                    key={poll._id}
                    href={`/schedule/${poll.slug}`}
                    className={styles.pollCard}
                  >
                    <div className={styles.pollHeader}>
                      <h3 className={styles.pollTitle}>{poll.title}</h3>
                      {poll.club && (
                        <span className={styles.clubBadge}>
                          {poll.club.shortName || poll.club.title}
                        </span>
                      )}
                    </div>
                    {poll.description && (
                      <p className={styles.pollDescription}>{poll.description}</p>
                    )}
                    <div className={styles.pollMeta}>
                      <span className={styles.pollCreator}>by {poll.createdBy}</span>
                      <span className={styles.pollResponses}>
                        {poll.responseCount} response{poll.responseCount !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <div className={styles.pollDates}>
                      {poll.dates?.slice(0, 3).map((date, i) => (
                        <span key={i} className={styles.dateChip}>
                          {new Date(date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      ))}
                      {poll.dates?.length > 3 && (
                        <span className={styles.dateChip}>+{poll.dates.length - 3} more</span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className={styles.emptyState}>
                <p>No polls yet. Create the first one!</p>
                <Link href="/schedule/new" className={styles.createBtnSecondary}>
                  Create Poll
                </Link>
              </div>
            )}
          </section>
        </div>
      </main>
      <Footer />
    </>
  )
}
