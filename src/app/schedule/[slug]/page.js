// src/app/schedule/[slug]/page.js
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import Link from 'next/link'
import { client } from '@/sanity/lib/client'
import { generateMetadata as createMetadata } from '@/lib/metadata'
import PollClient from './PollClient'
import styles from './poll.module.css'

export const dynamic = 'force-dynamic'
export const revalidate = 0

async function getPoll(slug) {
  const query = `*[_type == "availabilityPoll" && slug.current == $slug][0]{
    _id,
    title,
    description,
    createdBy,
    createdByEmail,
    createdAt,
    dates,
    startTime,
    endTime,
    timeSlotMinutes,
    timezone,
    responses,
    expiresAt,
    "club": club->{
      _id,
      title,
      shortName,
      "slug": slug.current
    }
  }`
  return client.fetch(query, { slug })
}

export async function generateMetadata({ params: paramsPromise }) {
  const params = await paramsPromise
  const poll = await getPoll(params.slug)

  if (!poll) {
    return createMetadata({
      title: 'Poll Not Found',
      description: 'The requested poll could not be found.',
      url: `/schedule/${params.slug}`,
    })
  }

  return createMetadata({
    title: poll.title,
    description: poll.description || `Find the best time for ${poll.title}. Add your availability!`,
    url: `/schedule/${params.slug}`,
  })
}

export default async function PollPage({ params: paramsPromise }) {
  const params = await paramsPromise
  const poll = await getPoll(params.slug)

  if (!poll) {
    return (
      <>
        <Header />
        <main className={styles.wrapper}>
          <div className={styles.container}>
            <h1 className={styles.title}>Poll Not Found</h1>
            <p>This poll doesn&apos;t exist or has been removed.</p>
            <Link href="/schedule" className={styles.backLink}>
              &larr; Back to Schedule
            </Link>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  // Check if expired
  const isExpired = poll.expiresAt && new Date(poll.expiresAt) < new Date()

  return (
    <>
      <Header />
      <main className={styles.wrapper}>
        <div className={styles.container}>
          <Link href="/schedule" className={styles.backLink}>
            &larr; Back to Schedule
          </Link>

          <header className={styles.header}>
            <div className={styles.titleRow}>
              <h1 className={styles.title}>{poll.title}</h1>
              {poll.club && (
                <Link
                  href={`/clubs/${poll.club.slug}`}
                  className={styles.clubBadge}
                >
                  {poll.club.shortName || poll.club.title}
                </Link>
              )}
            </div>
            {poll.description && (
              <p className={styles.description}>{poll.description}</p>
            )}
            <div className={styles.meta}>
              <span>Created by {poll.createdBy}</span>
              <span>•</span>
              <span>
                {new Date(poll.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
              <span>•</span>
              <span>{poll.responses?.length || 0} response{poll.responses?.length !== 1 ? 's' : ''}</span>
            </div>

            {isExpired && (
              <div className={styles.expiredBanner}>
                This poll has expired and is no longer accepting responses.
              </div>
            )}
          </header>

          <PollClient poll={poll} slug={params.slug} isExpired={isExpired} />
        </div>
      </main>
      <Footer />
    </>
  )
}
