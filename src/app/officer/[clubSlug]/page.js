// src/app/officer/[clubSlug]/page.js
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import { client } from '@/sanity/lib/client'
import { cookies } from 'next/headers'
import { verifySecureToken } from '@/lib/secure-tokens'
import DashboardClient from './DashboardClient'
import styles from './dashboard.module.css'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function generateMetadata({ params: paramsPromise }) {
  const params = await paramsPromise
  const club = await getClub(params.clubSlug)

  return {
    title: club ? `Officer Dashboard - ${club.title}` : 'Officer Dashboard',
    description: 'Manage your club announcements, events, and resources.',
    robots: { index: false, follow: false }
  }
}

async function getClub(slug) {
  return client.fetch(
    `*[_type == "club" && slug.current == $slug][0]{
      _id,
      title,
      "slug": slug.current,
      shortName,
      logo
    }`,
    { slug }
  )
}

async function getClubStats(clubId) {
  const [memberCount, upcomingEvents, announcements, resources] = await Promise.all([
    client.fetch(`count(*[_type == "member" && references($clubId)])`, { clubId }),
    client.fetch(
      `*[_type == "event" && (leadClub._ref == $clubId || $clubId in coHosts[]._ref) && date >= now()] | order(date asc)[0...5]{
        _id,
        title,
        "slug": slug.current,
        date,
        location,
        status
      }`,
      { clubId }
    ),
    client.fetch(
      `*[_type == "announcement" && club._ref == $clubId] | order(publishedAt desc)[0...5]{
        _id,
        title,
        "slug": slug.current,
        publishedAt,
        type,
        pinned
      }`,
      { clubId }
    ),
    client.fetch(
      `count(*[_type == "clubResource" && club._ref == $clubId])`,
      { clubId }
    )
  ])

  return {
    memberCount,
    upcomingEvents,
    recentAnnouncements: announcements,
    resourceCount: resources
  }
}

async function getRecentActivity(clubId) {
  // Get recent activity across different content types
  const [recentAnnouncements, recentEvents, recentPolls] = await Promise.all([
    client.fetch(
      `*[_type == "announcement" && club._ref == $clubId] | order(_createdAt desc)[0...3]{
        _id,
        _type,
        title,
        _createdAt,
        type
      }`,
      { clubId }
    ),
    client.fetch(
      `*[_type == "event" && (leadClub._ref == $clubId || $clubId in coHosts[]._ref)] | order(_createdAt desc)[0...3]{
        _id,
        _type,
        title,
        _createdAt,
        date
      }`,
      { clubId }
    ),
    client.fetch(
      `*[_type == "availabilityPoll" && club._ref == $clubId] | order(_createdAt desc)[0...3]{
        _id,
        _type,
        title,
        _createdAt,
        createdBy
      }`,
      { clubId }
    )
  ])

  // Combine and sort by creation date
  const allActivity = [...recentAnnouncements, ...recentEvents, ...recentPolls]
    .sort((a, b) => new Date(b._createdAt) - new Date(a._createdAt))
    .slice(0, 10)

  return allActivity
}

export default async function OfficerDashboardPage({ params: paramsPromise, searchParams: searchParamsPromise }) {
  const params = await paramsPromise
  const searchParams = await searchParamsPromise
  const club = await getClub(params.clubSlug)

  if (!club) {
    return (
      <>
        <Header />
        <main className={styles.wrapper}>
          <div className={styles.errorBox}>
            <h1 className={styles.errorTitle}>Club Not Found</h1>
            <p className={styles.errorText}>The club you are looking for does not exist.</p>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  // Check for valid session
  let session = null
  let sessionError = null

  // Check query param token first (magic link)
  if (searchParams.token) {
    try {
      const response = await fetch(
        `${process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/officer/verify`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: searchParams.token }),
          cache: 'no-store'
        }
      )

      if (response.ok) {
        const data = await response.json()
        session = {
          ...data,
          fromMagicLink: true
        }
      } else {
        const error = await response.json()
        sessionError = error.error || 'Invalid token'
      }
    } catch (error) {
      console.error('Token verification error:', error)
      sessionError = 'Failed to verify token'
    }
  }

  // Check for session token in cookies
  if (!session && !sessionError) {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get('officer_session')?.value

    if (sessionToken) {
      const verification = await verifySecureToken(sessionToken)
      if (verification.valid && verification.data.clubSlug === params.clubSlug) {
        session = {
          officer: {
            email: verification.data.email,
            role: verification.data.role
          },
          club: {
            id: verification.data.clubId,
            slug: verification.data.clubSlug
          },
          sessionToken
        }
      }
    }
  }

  // If we have a valid session, fetch dashboard data
  let dashboardData = null
  if (session) {
    const [stats, activity] = await Promise.all([
      getClubStats(club._id),
      getRecentActivity(club._id)
    ])
    dashboardData = { stats, activity }
  }

  return (
    <>
      <Header />
      <main className={styles.wrapper}>
        <DashboardClient
          club={club}
          session={session}
          sessionError={sessionError}
          dashboardData={dashboardData}
        />
      </main>
      <Footer />
    </>
  )
}
