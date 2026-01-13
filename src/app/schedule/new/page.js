// src/app/schedule/new/page.js
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import Link from 'next/link'
import { client } from '@/sanity/lib/client'
import PollForm from './PollForm'
import styles from './new.module.css'
import { generateMetadata as createMetadata } from '@/lib/metadata'

export const dynamic = 'force-dynamic'

export const metadata = createMetadata({
  title: 'Create Availability Poll',
  description: 'Create a new availability poll to find the best meeting time for your team.',
  url: '/schedule/new',
})

async function getClubs() {
  const query = `*[_type == "club"] | order(title asc) {
    _id,
    title,
    shortName
  }`
  return client.fetch(query)
}

export default async function NewPollPage() {
  const clubs = await getClubs()

  return (
    <>
      <Header />
      <main className={styles.wrapper}>
        <div className={styles.container}>
          <Link href="/schedule" className={styles.backLink}>
            &larr; Back to Schedule
          </Link>

          <header className={styles.header}>
            <h1 className={styles.title}>// Create Poll</h1>
            <p className={styles.subtitle}>
              Set up an availability poll to find the best time for everyone.
            </p>
          </header>

          <PollForm clubs={clubs} />
        </div>
      </main>
      <Footer />
    </>
  )
}
