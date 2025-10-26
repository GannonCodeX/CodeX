// app/events/[slug]/page.js
import { client } from '@/sanity/lib/client'
import imageUrlBuilder from '@sanity/image-url'
import Image from 'next/image'
import Link from 'next/link'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import PortableTextRenderer from '@/app/components/PortableTextRenderer'
import styles from './slug.module.css'
import { generateMetadata as createMetadata } from '@/lib/metadata'

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params: paramsPromise }) {
  const params = await paramsPromise;
  const event = await getEvent(params.slug);
  
  if (!event) {
    return createMetadata({
      title: 'Event Not Found',
      description: 'The requested event could not be found.',
      url: `/events/${params.slug}`
    });
  }

  const eventDate = new Date(event.date).toLocaleDateString();
  
  return createMetadata({
    title: event.title,
    description: event.description || `Join us for ${event.title} on ${eventDate} at ${event.location}. Hosted by ${event.leadClub?.title || 'Gannon CodeX'}.`,
    keywords: ['Event', event.title, 'Workshop', 'Tech Event', event.leadClub?.title, 'Gannon University'],
    image: event.mainImage ? imageUrlBuilder(client).image(event.mainImage).width(1200).height(630).url() : '/assets/images/2x Logo Header.png',
    url: `/events/${params.slug}`,
    type: 'article'
  });
}

const builder = imageUrlBuilder(client)


function urlFor(source) {
  return builder.image(source)
}

async function getEvent(slug) {
  const query = `*[_type == "event" && slug.current == $slug][0]{
    title,
    date,
    location,
    mainImage,
    description,
    content[]{
      ...,
      _type == "image" => {
        "asset": asset
      }
    },
    rsvpLink,
    leadClub->{title, "slug": slug.current},
    coHosts[]->{title, "slug": slug.current}
  }`
  const event = await client.fetch(query, { slug })
  return event
}


export default async function EventPage({ params: paramsPromise }) {
  const params = await paramsPromise; // Await the params promise
  const event = await getEvent(params.slug)

  if (!event) {
    return <div>Event not found</div>
  }

  const eventDate = new Date(event.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
  const eventTime = new Date(event.date).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <>
      <Header />
      <main className={styles.wrapper}>
        <article>
          <header className={styles.header}>
            <Link href="/events" className={styles.backLink}>&larr; All Events</Link>
            <h1 className={styles.title}>{event.title}</h1>
            {event.mainImage && (
              <div className={styles.imageWrapper}>
                <Image
                  src={urlFor(event.mainImage).width(1200).url()}
                  alt={event.title}
                  width={1200}
                  height={600}
                  className={styles.mainImage}
                />
              </div>
            )}
          </header>

          <div className={styles.contentGrid}>
            <aside className={styles.sidebar}>
              <div className={styles.infoBox}>
                <h2 className={styles.sidebarTitle}>// Details</h2>
                <p><strong>Date:</strong> {eventDate}</p>
                <p><strong>Time:</strong> {eventTime}</p>
                <p><strong>Location:</strong> {event.location}</p>
              </div>
              {(event.leadClub || (event.coHosts && event.coHosts.length)) && (
                <div className={styles.infoBox}>
                  <h2 className={styles.sidebarTitle}>// Clubs</h2>
                  <div className={styles.clubList}>
                    {event.leadClub && (
                      <a href={`/clubs/${event.leadClub.slug}`} className={styles.clubTag}>
                        {event.leadClub.title}
                      </a>
                    )}
                    {event.coHosts?.map((c, idx) => (
                      <a key={idx} href={`/clubs/${c.slug}`} className={styles.clubTag}>
                        {c.title}
                      </a>
                    ))}
                  </div>
                </div>
              )}
              {event.rsvpLink && (
                <a href={event.rsvpLink} target="_blank" rel="noopener noreferrer" className={styles.rsvpButton}>
                  RSVP Now
                </a>
              )}
            </aside>
            <div className={styles.mainContent}>
              <PortableTextRenderer content={event.content} />
            </div>
          </div>
        </article>
      </main>
      <Footer />
    </>
  )
}
